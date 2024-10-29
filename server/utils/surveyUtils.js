// Process survey results and send notifications
const processSurveyResults = async (connection, surveyId) => {
	try {
	  // Get survey details
	  const [surveyDetails] = await connection.query(`
		SELECT s.*
		FROM SURVEY s
		WHERE s.SURVEY_ID = ?
	  `, [surveyId]);
  
	  if (!surveyDetails.length) return;
  
	  // Get total responses and breakdown
	  const [responses] = await connection.query(`
		SELECT RESPONSE, COUNT(*) as count
		FROM OWNER_SURVEY_MAP
		WHERE SURVEY_ID = ?
		GROUP BY RESPONSE
		ORDER BY RESPONSE
	  `, [surveyId]);
  
	  const totalResponses = responses.reduce((sum, r) => sum + r.count, 0);
	  const resultsMessage = formatSurveyResults(surveyDetails[0], responses, totalResponses);
  
	  await sendSurveyResults(connection, resultsMessage);
	  await updateSurveyStatus(connection, surveyId);
  
	} catch (error) {
	  console.error('Error processing survey results:', error);
	  throw error;
	}
  };
  
  // Format survey results into a message
  const formatSurveyResults = (survey, responses, totalResponses) => {
	let resultsMessage = `Survey Results\n\n`;
	resultsMessage += `Question: ${survey.MESSAGE}\n\n`;
	resultsMessage += `Total Responses: ${totalResponses}\n\n`;
  
	if (totalResponses > 0) {
	  resultsMessage += `Results:\n`;
	  responses.forEach(response => {
		const percentage = ((response.count / totalResponses) * 100).toFixed(1);
		const answerText = survey[`ANSWER_${response.RESPONSE}`];
		resultsMessage += `${answerText}: ${response.count} responses (${percentage}%)\n`;
	  });
	} else {
	  resultsMessage += 'No responses were received for this survey.';
	}
  
	return resultsMessage;
  };
  
  // Send survey results to all owners
  const sendSurveyResults = async (connection, resultsMessage) => {
	// Insert system message with results
	const [messageResult] = await connection.query(
	  'INSERT INTO MESSAGE (SENDER_ID, MESSAGE, CREATED) VALUES (?, ?, NOW())',
	  [999999999, resultsMessage] // System message sender ID
	);
  
	// Get all owners
	const [owners] = await connection.query('SELECT OWNER_ID FROM OWNER');
  
	// Send message to each owner
	for (const owner of owners) {
	  const [messageResult] = await connection.query(
		'INSERT INTO MESSAGE (SENDER_ID, RECEIVER_ID, MESSAGE, CREATED) VALUES (?, ?, ?, NOW())',
		[999999999, owner.OWNER_ID, resultsMessage]
	  );
  
	  // Create the owner_message_map entry
	  await connection.query(
		'INSERT INTO OWNER_MESSAGE_MAP (OWNER_ID, MESSAGE_ID) VALUES (?, ?)',
		[owner.OWNER_ID, messageResult.insertId]
	  );
	}
  };
  
  // Update the survey status
  const updateSurveyStatus = async (connection, surveyId) => {
	await connection.query(`
	  UPDATE SURVEY
	  SET STATUS = 'INACTIVE',
		  RESULTS_SENT = TRUE
	  WHERE SURVEY_ID = ?
	`, [surveyId]);
  };
  
  module.exports = {
	processSurveyResults
  };
  