const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const users = require('./users');

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (ticket) => {
    axios.post('https://hooks.zapier.com/hooks/catch/404051/ier6et/', qs.stringify({
      'Fellow': ticket.fellow,
      'Country': ticket.country,
      'Dates': ticket.dates,
      'Partner': ticket.partner,
      'Budget': ticket.budget,
      'Date': Date.now(),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
  
 axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: ticket.fellow,
    as_user: false,
    username: 'travelbot',
    text: 'Hi! I\'m TravelBot--here to help you get your visa for traveling :smile:.',
    attachments: JSON.stringify([
      {
      text: ticket.text,
      
        fallback: 'Pre-filled because you have actions in your attachment.',
        callback_id: 'visa_holder',
        attachment_type: 'default',
        title: 'Before we get started, do you already have a visa? ',
        actions: [
          {
            name: 'Yes! I have one',
            text: 'Yes! I have one',
            type: 'button',
            style: 'primary',
            value: 'yes'
          },
          {
            name: 'No, I don\'t have a visa yet. ',
            text: 'No, I don\'t have a visa yet. ',
            type: 'button',
            style: 'danger',
            value: 'no'
          }
        ]
      }
    ]),

   
   
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });

 // adding more


  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: '#fellows-traveling',
    text: 'Fellow added!',
    attachments: JSON.stringify([
      {
        title: `${ticket.fellow} has been added by ${ticket.userEmail}`,
        // Get this from the 3rd party helpdesk system
        title_link: 'https://docs.google.com/spreadsheets/d/1QGGx7DmNsnhx8X1SV4tKvvPReLRA6emtvJXb5khGVs8/edit#gid=955276887',
        text: ticket.text,
        fields: [
          {
          title: 'Fellow Traveling:',
          value: ticket.fellow,
          'short': true
        },
        {
          title: 'Partner:',
          value: ticket.partner,
          'short': true
        },
        {
          title: 'Travel Center',
          value: ticket.country,
          'short': true
        },
        {
          title: 'Target Travel Dates',
          value: ticket.dates,
          'short': true
        },
        {
          title: 'Budget is coming from:',
          value: ticket.budget,
          'short': true
        },
        ],
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });

};
//adding more to fellow post


// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const ticket = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });


  fetchUserEmail.then((result) => {
    ticket.userId = userId;
    ticket.userEmail = result;
    ticket.fellow = submission.fellow;
    ticket.country = submission.country;
    ticket.dates = submission.dates;
    ticket.partner = submission.partner;
    ticket.budget = submission.budget;
    ticket.date = submission.date;
    sendConfirmation(ticket);

    return ticket;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };