const {google} = require('googleapis');
const {client_secret, client_id, redirect_uris} = require('../credentials.json');
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
const user = 'user@gmail.com'; // Add the email address
const name = 'User Name'; // Add the user's official name

// 1. Authorization
async function authorize() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.modify']
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    const code = ''; //Paste the code you get from the auth url here
    const {tokens} = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
}

// 2. Checking new emails
async function checkForNewEmails() {
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    const res = await gmail.users.messages.list({userId: `${user}`});
    const messages = res.data.messages;
    if(messages){
        //Process each message
    }
    else{
        console.log('No new messages');
    }
}

// 3. Filter previously replied emails
async function filterMessagesWithNoReplies(messages){
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    const filteredMessages = [];
    for(const message of messages){

        const thread = await gmail.users.threads.get({userId: `${user}`, id: message.threadId});
        const sentByMe = thread.data.messages.some(m => m.labelIds.includes('SENT') && m.payload.headers.find(h => h.name === 'To' && h.value.includes(`${user}`)));
        if(!sentByMe){
            filteredMessages.push(message);
        }
    }
    return filteredMessages;
}

//4. Send Emails
async function sendReply(message){
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    const headers = message.payload.headers;
    const to = headers.find(h => h.name === 'From').value;
    const subject = headers.find(h => h.name === 'Subject').value;
    const text = `Hi there, thanks for you email! I'm currently out of office, but I'll get back to you as soon as I can. Best regards, ${name}`;
    const utf8text = Buffer.from(text, 'utf-8').toString('base-64');
    const messageParts = [
        `From: ${user}`,
        `To: ${to}`,
        `Subject: Re: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: base64',
        '',
        utf8text
    ];
    const encodedMessage = messageParts.join('\r\n').trim();
    const res = await gmail.users.messages.send({userId: `${user}`, requestBody: {raw: encodedMessage}});
    console.log(`Reply sent to ${to}. Message Id: ${res.data.id}`);
}

// 5. Adds Label in Gmail
async function addLabelToMessage(message, labelName){
    const gmail = google.gmail({version: 'v1', auth: oAuth2Client});
    const labels = await gmail.users.labels.list({userId: `${user}`});
    const label = labels.data.labels.find(l => l.name===labelName) ||
    await gmail.users.labels.create({userId: `${user}`, requestBody: {name: labelName}});
    const res = await gmail.users.messages.modify({
        userId: `${user}`,
        id: message.id,
        requestBody: {addLabelIds: [label.id], removeLabelIds: ['INBOX']}
    });
    console.log(`Message ${message.id} labeled with ${label.name}.`);
}

// 6. If authenticated, take actions and checks for email every 45 - 120 seconds
authorize().then( () => {
    setInterval(async () => {
        console.log('Checking for new emails...');
        const res = await google.gmail({version: 'v1', auth: oAuth2Client}).users.messages.list({userId: `${user}`});
        const messages = res.data.messages;
        if(messages){
            const filteredMessages = await filterMessagesWithNoReplies(messages);
            console.log(`${filteredMessages.length} new messages found.`);
            for (const message of filteredMessages){
                await sendReply(message);
                await addLabelToMessage(message, 'Vacation Reply Sent');
            }
        }
        else{
            console.log('No new messages.');
        }
    },
    Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
});
