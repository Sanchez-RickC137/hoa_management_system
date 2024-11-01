-- Create the database
CREATE DATABASE hoa_management;
USE hoa_management;

-- Create tables without foreign key constraints
CREATE TABLE ACCOUNT (
    ACCOUNT_ID INT AUTO_INCREMENT PRIMARY KEY,
    OWNER_ID INT,
    PROPERTY_ID INT,
    BALANCE DECIMAL(10, 2),
    CARD_ON_FILE VARCHAR(255)
);

CREATE TABLE ACCOUNT_CHARGE (
    CHARGE_ID INT AUTO_INCREMENT PRIMARY KEY,
    ACCOUNT_ID INT,
    CHARGE_TYPE VARCHAR(255),
    PAYMENT_DUE_DATE DATE,
    VIOLATION_DATE DATE,
    VIOLATION_TYPE_ID INT,
    ASSESS_DATE DATE,
    RATE_ID INT,
    ASSESS_TYPE_ID INT,
    ISSUED_BY INT
);

CREATE TABLE ACCOUNT_OWNER_MAP (
    ACCOUNT_ID INT,
    OWNER_ID INT,
    PURCHASE_DATE DATE,
    SELL_DATE DATE,
    PRIMARY KEY (ACCOUNT_ID, OWNER_ID)
);

CREATE TABLE ANNOUNCEMENT_NEWS (
    ANNOUNCEMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
    MESSAGE TEXT,
    FILE_BLOB LONGBLOB,
    FILE_MIME VARCHAR(255),
    FILE_NAME VARCHAR(255),
    CREATED DATETIME,
    CREATED_BY INT
);

CREATE TABLE ASSESSMENT_RATE (
    RATE_ID INT AUTO_INCREMENT PRIMARY KEY,
    ASSESSMENT_YEAR VARCHAR(4),
    AMOUNT DECIMAL(10, 2),
    CHANGED_BY INT
);

CREATE TABLE ASSESSMENT_TYPE (
    TYPE_ID INT AUTO_INCREMENT PRIMARY KEY,
    ASSESSMENT_DESCRIPTION TEXT
);

CREATE TABLE BOARD_MEMBER_ADMIN (
    MEMBER_ID INT AUTO_INCREMENT PRIMARY KEY,
    MEMBER_ROLE VARCHAR(255),
    ASSESS_FINES CHAR(1),
    CHANGE_RATES CHAR(1),
    CHANGE_MEMBERS CHAR(1)
);

CREATE TABLE DOCUMENT (
    DOCUMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
    FILE_BLOB LONGBLOB,
    FILE_MIME VARCHAR(255),
    FILE_NAME VARCHAR(255),
    CREATED DATETIME,
    CREATED_BY INT
);

CREATE TABLE MESSAGE (
    MESSAGE_ID INT AUTO_INCREMENT PRIMARY KEY,
    MESSAGE TEXT,
    CREATED DATETIME,
    SENDER_ID INT,
    RECEIVER_ID INT,
    UPDATED_ON DATETIME
);

CREATE TABLE OWNER (
    OWNER_ID INT AUTO_INCREMENT PRIMARY KEY,
    LAST_NAME VARCHAR(50),
    FIRST_NAME VARCHAR(50),
    PHONE VARCHAR(20),
    EMAIL VARCHAR(255),
    COMM_OPT_OUT CHAR(1),
    VOTING_RIGHTS CHAR(1),
    PASSWORD_HASH VARCHAR(255)  -- New column for storing hashed passwords
);

CREATE TABLE OWNER_BOARD_MEMBER_MAP (
    OWNER_ID INT,
    BOARD_MEMBER_ID INT,
    START_DATE DATE,
    END_DATE DATE,
    PRIMARY KEY (OWNER_ID, BOARD_MEMBER_ID)
);

CREATE TABLE OWNER_MESSAGE_MAP (
    OWNER_ID INT,
    MESSAGE_ID INT,
    PRIMARY KEY (OWNER_ID, MESSAGE_ID)
);

CREATE TABLE OWNER_SURVEY_MAP (
    OWNER_ID INT,
    SURVEY_ID INT,
    RESPONSE INT,
    RESPONSE_DATE DATETIME,
    PRIMARY KEY (OWNER_ID, SURVEY_ID)
);

CREATE TABLE PAYMENT (
    PAYMENT_ID INT AUTO_INCREMENT PRIMARY KEY,
    ACCOUNT_ID INT,
    OWNER_ID INT,
    DATE_OF_PAYMENT DATE,
    PAYMENT_AMOUNT DECIMAL(10, 2)
);

CREATE TABLE PROPERTY (
    PROP_ID INT AUTO_INCREMENT PRIMARY KEY,
    UNIT INT,
    STREET VARCHAR(255),
    CITY VARCHAR(255),
    STATE VARCHAR(255),
    ZIP_CODE VARCHAR(10)
);

CREATE TABLE PROPERTY_OWNER_MAP (
    PROPERTY_ID INT,
    OWNER_ID INT,
    PURCHASE_DATE DATE,
    SELL_DATE DATE,
    PRIMARY KEY (PROPERTY_ID, OWNER_ID)
);

CREATE TABLE SURVEY (
    SURVEY_ID INT AUTO_INCREMENT PRIMARY KEY,
    MESSAGE TEXT,
    ANSWER_1 TEXT,
    ANSWER_2 TEXT,
    ANSWER_3 TEXT,
    ANSWER_4 TEXT,
    CREATED_BY INT
);

CREATE TABLE VIOLATION_TYPE (
    TYPE_ID INT AUTO_INCREMENT PRIMARY KEY,
    VIOLATION_RATE DECIMAL(10, 2),
    VIOLATION_DESCRIPTION TEXT
);

-- After bulk import, run these ALTER TABLE statements to add foreign key constraints

ALTER TABLE ACCOUNT
ADD CONSTRAINT FK_ACCOUNT_PROPERTY
FOREIGN KEY (PROPERTY_ID) REFERENCES PROPERTY(PROP_ID);

ALTER TABLE ACCOUNT_CHARGE
ADD CONSTRAINT FK_ACCOUNT_CHARGE_ACCOUNT
FOREIGN KEY (ACCOUNT_ID) REFERENCES ACCOUNT(ACCOUNT_ID),
ADD CONSTRAINT FK_ACCOUNT_CHARGE_VIOLATION_TYPE
FOREIGN KEY (VIOLATION_TYPE_ID) REFERENCES VIOLATION_TYPE(TYPE_ID),
ADD CONSTRAINT FK_ACCOUNT_CHARGE_BOARD_MEMBER
FOREIGN KEY (ISSUED_BY) REFERENCES BOARD_MEMBER_ADMIN(MEMBER_ID),
ADD CONSTRAINT FK_ACCOUNT_CHARGE_ASSESSMENT_RATE
FOREIGN KEY (RATE_ID) REFERENCES ASSESSMENT_RATE(RATE_ID),
ADD CONSTRAINT FK_ACCOUNT_CHARGE_ASSESSMENT_TYPE
FOREIGN KEY (ASSESS_TYPE_ID) REFERENCES ASSESSMENT_TYPE(TYPE_ID);

ALTER TABLE ACCOUNT_OWNER_MAP
ADD CONSTRAINT FK_ACCOUNT_OWNER_MAP_ACCOUNT
FOREIGN KEY (ACCOUNT_ID) REFERENCES ACCOUNT(ACCOUNT_ID),
ADD CONSTRAINT FK_ACCOUNT_OWNER_MAP_OWNER
FOREIGN KEY (OWNER_ID) REFERENCES OWNER(OWNER_ID);

ALTER TABLE ANNOUNCEMENT_NEWS
ADD CONSTRAINT FK_ANNOUNCEMENT_NEWS_BOARD_MEMBER
FOREIGN KEY (CREATED_BY) REFERENCES BOARD_MEMBER_ADMIN(MEMBER_ID);

ALTER TABLE DOCUMENT
ADD CONSTRAINT FK_DOCUMENT_BOARD_MEMBER
FOREIGN KEY (CREATED_BY) REFERENCES BOARD_MEMBER_ADMIN(MEMBER_ID);

ALTER TABLE OWNER_BOARD_MEMBER_MAP
ADD CONSTRAINT FK_OWNER_BOARD_MEMBER_MAP_OWNER
FOREIGN KEY (OWNER_ID) REFERENCES OWNER(OWNER_ID),
ADD CONSTRAINT FK_OWNER_BOARD_MEMBER_MAP_BOARD_MEMBER
FOREIGN KEY (BOARD_MEMBER_ID) REFERENCES BOARD_MEMBER_ADMIN(MEMBER_ID);

ALTER TABLE OWNER_MESSAGE_MAP
ADD CONSTRAINT FK_OWNER_MESSAGE_MAP_OWNER
FOREIGN KEY (OWNER_ID) REFERENCES OWNER(OWNER_ID),
ADD CONSTRAINT FK_OWNER_MESSAGE_MAP_MESSAGE
FOREIGN KEY (MESSAGE_ID) REFERENCES MESSAGE(MESSAGE_ID);

ALTER TABLE OWNER_SURVEY_MAP
ADD CONSTRAINT FK_OWNER_SURVEY_MAP_OWNER
FOREIGN KEY (OWNER_ID) REFERENCES OWNER(OWNER_ID),
ADD CONSTRAINT FK_OWNER_SURVEY_MAP_SURVEY
FOREIGN KEY (SURVEY_ID) REFERENCES SURVEY(SURVEY_ID);

ALTER TABLE PAYMENT
ADD CONSTRAINT FK_PAYMENT_ACCOUNT
FOREIGN KEY (ACCOUNT_ID) REFERENCES ACCOUNT(ACCOUNT_ID),
ADD CONSTRAINT FK_PAYMENT_OWNER
FOREIGN KEY (OWNER_ID) REFERENCES OWNER(OWNER_ID);

ALTER TABLE PROPERTY_OWNER_MAP
ADD CONSTRAINT FK_PROPERTY_OWNER_MAP_PROPERTY
FOREIGN KEY (PROPERTY_ID) REFERENCES PROPERTY(PROP_ID),
ADD CONSTRAINT FK_PROPERTY_OWNER_MAP_OWNER
FOREIGN KEY (OWNER_ID) REFERENCES OWNER(OWNER_ID);

ALTER TABLE SURVEY
ADD CONSTRAINT FK_SURVEY_BOARD_MEMBER
FOREIGN KEY (CREATED_BY) REFERENCES BOARD_MEMBER_ADMIN(MEMBER_ID);