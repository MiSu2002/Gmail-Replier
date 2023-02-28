# Gmail-Replier: Vacation email auto-response app

## PLEASE DOWNLOAD THE CREDENTIALS JSON FILE FROM YOUR GOOGLE GMAIL API SERVICE AND THEN RENAME THE FILE AS 'credentials.json' and locate it in ./ for successfull working.
## DON'T FORGET TO USE THE CODE THAT YOU RECEIVED FROM YOUR AUTHORIZATION URI
## PLEASE CHANGE THE UserId to your user id and email to your email address

Overview:
A Node.js based app that is able to respond to emails sent to the owner's Gmail mailbox while the owner is out on a vacation.

What's more:
This is a JavaScript code for a Gmail bot that automatically sends vacation replies to incoming emails. The bot uses the Google API to access Gmail and performs the following actions:

- Authorization: Generates an authentication URL and prompts the user to visit the URL to grant authorization to the bot. The authorization is required to access the Gmail account.

- Checking new emails: Fetches a list of all new emails in the inbox of the specified Gmail account.

- Filter previously replied emails: Filters out any emails that have already been replied to by the bot.

- Send Emails: Sends a vacation reply to each filtered email.

- Adds Label in Gmail: Adds a label to each filtered email to keep track of which emails have been replied to.

- If authenticated, take actions and checks for email every 45 - 120 seconds: Sets a timer to check for new emails every 45 to 120 seconds and repeats the above actions for each new email.

Note: The code requires the installation of the googleapis package and the credentials.json file containing the client ID, client secret, and redirect URIs for the Google API.
