const validateAmount = (amount) => {
	const numAmount = parseFloat(amount);
	if (isNaN(numAmount)) {
	  throw new Error('Invalid amount format');
	}
	return numAmount;
  };
  
  const formatCurrency = (amount) => {
	return validateAmount(amount).toFixed(2);
  };
  
  module.exports = {
	validateAmount,
	formatCurrency
  };
  