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
    text: 'Hi Im TravelBot--Here to help you go through the visa process. I will send you the steps to obtain your visa throughout this week. Please submit the steps in a timely fashion!',
    attachments: JSON.stringify([
      {
        title: 'Below are the things we have to accompish to get you your visa to travel.',
        // Get this from the 3rd party helpdesk system
        // title_link: 'http://example.com',
        text: ticket.text,
        fields: [
          {
            value: ':small_blue_diamond: Submit Visa Application',
          },
          {
            value: ':small_blue_diamond: Schedule Interview',
          },
          {
            value: ':small_blue_diamond: Complete Interview Prep',
          },
          {
            value: ':small_blue_diamond: Collect all relevant documents',
          },
           {
            value: ':small_blue_diamond: Attend Interview',
          },
          {
            value: 'Please start by reading this document (http://example.com). When complete click next.',
          },
        ],
        fallback: 'Pre-filled because you have actions in your attachment.',
        color: '#30C3DD',
        callback_id: 'decision',
        attachment_type: 'default',
      actions: [
        {
          name: 'next',
          text: 'Next!',
          type: 'button',
          style: 'primary',
          value: 'next'
        },
        {
          name: 'No, please remind me!',
          text: 'No, please remind me!',
          type: 'select',
          style: 'danger',
          'options': [
             {
                            "text": "In 20 minutes",
                            "value": "20 mins"
                        },
                        {
                            "text": "In 1 Hour",
                            "value": "1 hour"
                        },
            {
                            "text": "In 3 Hours",
                            "value": "3 hours"
                        },
            {
                            "text": "In 24 Hours",
                            "value": "24 hours"
                        },
          ]
        },
      ]
      },
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
        title: `Fellow has been added by ${ticket.userEmail}`,
        // Get this from the 3rd party helpdesk system
        title_link: 'http://example.com',
        text: ticket.text,
        fields: [
          {
            title: 'Fellow Handle',
            value: ticket.fellow,
          },
          {
            title: 'Country',
            value: ticket.country,
          },
          {
            title: 'PXL',
            value: ticket.pxl,
          },
          {
            title: 'Partner',
            value: ticket.partner,
          },
          {
            title: 'Partner Address',
            value: ticket.address,
          },
          {
            title: 'Partner Email',
            value: ticket.email,
          },
          {
            title: 'Travel Dates',
            value: ticket.dates,
          },
          {
            title: 'Date Submitted',
            value: Date.now(),
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
