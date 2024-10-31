import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Home, FileCog, UserCog, DollarSign, CalendarPlus, CalendarCog,
  AlertTriangle, ClipboardList, Frown, Shuffle,
  UserRoundPlus, FileUp, ClipboardPlus
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateAnnouncementModal from '../../components/CreateAnnouncementModal';
import UploadDocumentModal from '../../components/UploadDocumentModal';
import CreateSurveyModal from '../../components/CreateSurveyModal';
import IssueViolationModal from '../../components/IssueViolationModal';
import UpdateViolationsModal from '../../components/UpdateViolationsModal';
import IssueAssessmentModal from '../../components/IssueAssessmentModal';
import ManageAssessmentsModal from '../../components/ManageAssessmentsModal';
import NewAccountModal from '../../components/NewAccountModal';
import BoardMemberSettingsModal from '../../components/BoardMemberSettingsModal';
import UpdateBoardMembersModal from '../../components/UpdateBoardMembersModal';
import ManageAnnouncementsModal from '../../components/ManageAnnouncementsModal';
import ManageDocumentsModal from '../../components/ManageDocumentsModal';


const DashboardCard = ({ icon: Icon, title, description, onClick, disabled }) => {
  const { isDarkMode } = useTheme();
  
  const cardStyles = `
    flex flex-col items-center justify-center p-6 text-center
    rounded-lg shadow-lg transition-colors duration-200 w-full h-full
    ${disabled 
      ? isDarkMode 
        ? 'bg-darkblue-dark opacity-50 cursor-not-allowed'
        : 'bg-greenblack-light opacity-50 cursor-not-allowed'
      : isDarkMode
        ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark cursor-pointer'
        : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light cursor-pointer'
    }
  `;

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cardStyles}
      title={disabled ? "You don't have permission for this action" : title}
    >
      <Icon className={`w-12 h-12 mb-4 ${disabled ? 'opacity-50' : ''}`} />
      <h3 className={`text-lg font-semibold mb-2 ${disabled ? 'opacity-50' : ''}`}>{title}</h3>
      <p className={`text-sm ${disabled ? 'opacity-50' : 'opacity-90'}`}>{description}</p>
      {disabled && (
        <div className="mt-2 text-xs text-red-500">
          Permission Required
        </div>
      )}
    </button>
  );
};


const BoardMemberDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user, hasBoardPermission } = useAuth(); 
  const navigate = useNavigate();

  // Modal states
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateSurveyModal, setShowCreateSurveyModal] = useState(false);
  const [showIssueViolationModal, setShowIssueViolationModal] = useState(false);
  const [showUpdateViolationsModal, setShowUpdateViolationsModal] = useState(false);
  const [showIssueAssessmentModal, setShowIssueAssessmentModal] = useState(false);
  const [showManageAssessmentsModal, setShowManageAssessmentsModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showBoardSettingsModal, setShowBoardSettingsModal] = useState(false);
  const [showUpdateBoardMembersModal, setShowUpdateBoardMembersModal] = useState(false);
  const [showManageDocumentsModal, setShowManageDocumentsModal] = useState(false);
  const [showManageAnnouncementsModal, setShowManageAnnouncementsModal] = useState(false);

  useEffect(() => {
    // Debug logging
    if (user?.boardMemberDetails) {
      console.log('Board Member Details:', {
        ASSESS_FINES: user.boardMemberDetails.ASSESS_FINES,
        CHANGE_RATES: user.boardMemberDetails.CHANGE_RATES,
        CHANGE_MEMBERS: user.boardMemberDetails.CHANGE_MEMBERS
      });
    }
  }, [user]);

  const canAssessFines = user?.boardMemberDetails?.ASSESS_FINES === '1';
  const canChangeRates = user?.boardMemberDetails?.CHANGE_RATES === '1';
  const canChangeMembers = user?.boardMemberDetails?.CHANGE_MEMBERS === '1';

  const actionCards = [
    {
      icon: CalendarPlus,
      title: "Create Announcement/Event",
      description: "Post new announcements or schedule community events",
      onClick: () => setShowCreateAnnouncementModal(true)
    },
    {
      icon: CalendarCog,
      title: "Manage Announcement/Event",
      description: "Manage current announcements or schedule community events",
      onClick: () => setShowManageAnnouncementsModal(true)
    },
    {
      icon: ClipboardList,
      title: "Create Survey",
      description: "Create and manage community surveys",
      onClick: () => setShowCreateSurveyModal(true)
    },
    {
      icon: FileUp,
      title: "Upload New Documents",
      description: "Upload and manage community documents",
      onClick: () => setShowUploadModal(true)
    },
    {
      icon: FileCog,
      title: "Manage Documents",
      description: "Download or delete existing documents",
      onClick: () => setShowManageDocumentsModal(true)
    },
    {
      icon: Frown,
      title: "Issue Violation",
      description: "Record and issue violation notices to residents",
      onClick: () => setShowIssueViolationModal(true),
      disabled: !canAssessFines
    },
    {
      icon: AlertTriangle,
      title: "Update HOA Violations",
      description: "Update HOA Violation types and rates",
      onClick: () => setShowUpdateViolationsModal(true),
      disabled: !canChangeRates
    },
    {
      icon: DollarSign,
      title: "Issue Assessments",
      description: "Issue community assessments",
      onClick: () => setShowIssueAssessmentModal(true),
      disabled: !canChangeRates
    },
    {
      icon: ClipboardPlus,
      title: "Manage Assessments",
      description: "Create and manage community assessments",
      onClick: () => setShowManageAssessmentsModal(true),
      disabled: !canChangeRates
    },
    {
      icon: UserRoundPlus,
      title: "New Account Creation",
      description: "Create new owners and account for home purchase",
      onClick: () => setShowNewAccountModal(true),
      disabled: !canChangeMembers
    },
    {
      icon: UserCog,
      title: "Board Member Settings",
      description: "Manage board member roles and permissions",
      onClick: () => setShowBoardSettingsModal(true),
      disabled: !canChangeMembers
    },
    {
      icon: Shuffle,
      title: "Update Board Members",
      description: "Update resident roles as board members",
      onClick: () => setShowUpdateBoardMembersModal(true),
      disabled: !canChangeMembers
    },
  ];

  return (
    <div className={`min-h-screen rounded-lg shadow-lg ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl text-center font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Board Member Actions
          </h1>
          <p className={`mt-2 text-center ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Quick access to board member functions and controls
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => (
            <div key={index} className="h-48">
              <DashboardCard {...card} />
            </div>
          ))}
        </div>

        {/* Modals */}
        {showCreateAnnouncementModal && (
          <CreateAnnouncementModal
            onClose={() => setShowCreateAnnouncementModal(false)}
            onSuccess={() => {
              setShowCreateAnnouncementModal(false);
            }}
          />
        )}

        {showUploadModal && (
          <UploadDocumentModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
            }}
          />
        )}

        {showCreateSurveyModal && (
          <CreateSurveyModal
            onClose={() => setShowCreateSurveyModal(false)}
          />
        )}

        {showIssueViolationModal && (
          <IssueViolationModal
            onClose={() => setShowIssueViolationModal(false)}
          />
        )}

        {showUpdateViolationsModal && (
          <UpdateViolationsModal
            onClose={() => setShowUpdateViolationsModal(false)}
          />
        )}

        {showIssueAssessmentModal && (
          <IssueAssessmentModal
            onClose={() => setShowIssueAssessmentModal(false)}
          />
        )}

        {showManageAssessmentsModal && (
          <ManageAssessmentsModal
            onClose={() => setShowManageAssessmentsModal(false)}
          />
        )}

        {showNewAccountModal && (
          <NewAccountModal
            onClose={() => setShowNewAccountModal(false)}
          />
        )}

        {showBoardSettingsModal && (
          <BoardMemberSettingsModal
            onClose={() => setShowBoardSettingsModal(false)}
          />
        )}

        {showUpdateBoardMembersModal && (
          <UpdateBoardMembersModal
            onClose={() => setShowUpdateBoardMembersModal(false)}
          />
        )}

        {showManageAnnouncementsModal && (
          <ManageAnnouncementsModal
            onClose={() => setShowManageAnnouncementsModal(false)}
          />
        )}

        {showManageDocumentsModal && (
          <ManageDocumentsModal
            onClose={() => setShowManageDocumentsModal(false)}
          />
        )}

      </div>
    </div>
  );
};

export default BoardMemberDashboard;