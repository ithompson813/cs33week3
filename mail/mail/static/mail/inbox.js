document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // send email using the send_email function
  document.querySelector('#send_email').addEventListener('click', send_email);

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#details-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#details-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  
  //call the load_inbox function to show the inbox's contents, defined below
  load_inbox(mailbox);

}


//sends email from the compose-view
function send_email() {

  //Posts to the API and fills in data from the compose-view fields
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
    })
  })

  //update inbox
  location.reload();

}

//the load_inbox function displays the relevant inbox based on the mailbox variable defiend above
function load_inbox(mailbox){

  //acquire emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    //loop through emails
    for (let i = 0; i < emails.length; i++){

      //define parent div to house each individual email     
      let parent_div = document.createElement('div');

      //define html elements for email info
      let subject = document.createElement('h6')
      let sender = document.createElement('h5')
      let time_stamp = document.createElement('p')

      //write data to html elements
      subject.innerHTML = emails[i]['subject']
      sender.innerHTML = emails[i]['sender']
      time_stamp.innerHTML = emails[i]['timestamp']

      //append parent div with html elements
      parent_div.appendChild(sender)
      parent_div.appendChild(subject)
      parent_div.appendChild(time_stamp)

      //give parent div some style elements
      parent_div.style.border = 'outset'
      parent_div.style.padding = '3%'

      //change background color depending on read status
      if (emails[i]['read'] === false){
        parent_div.style.backgroundColor = '#cccccc'    
      } else {
        parent_div.style.backgroundColor = 'white'
      }

      // onclick event for displaying email details, defined below
      parent_div.addEventListener("click", function(){ show_email(emails[i]['id'])});

      //write parent div to emails-view element
      document.querySelector('#emails-view').appendChild(parent_div)

    }

  });

}

//the show_email function is called from an onclick function on an email div, defined above
//this function switches views to display the contents of an email and allowing users options to interact with it
function show_email(id){

  //close other views and allow the details-view to be seen
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#details-view').style.display = 'block';
  
  //reset child elements of details-view to prevent overlap
  while(document.querySelector('#details-view').firstChild) {
    document.querySelector('#details-view').removeChild(document.querySelector('#details-view').firstChild);
  }

  //acquire email details from API
  //email id is passed by onclick function on each email's inbox display
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

      //create div to house email information
      let div = document.createElement('div');

      //create elements to house details
      let sender = document.createElement('h3')
      let recipients = document.createElement('h3')
      let subject = document.createElement('h1')
      let body = document.createElement('p')
      let time_stamp = document.createElement('p')

      //fill elements with data from email
      sender.innerHTML = `From: ${email['sender']}`;
      recipients.innerHTML = `To: ${email['recipients']}`;
      subject.innerHTML = email['subject']
      body.innerHTML = email['body'];
      time_stamp.innerHTML = `Sent: ${email['timestamp']}`;

      //write elements to parent div
      div.appendChild(sender);
      div.appendChild(recipients);
      div.appendChild(subject);
      div.appendChild(body);
      div.appendChild(time_stamp);

      //add archive/unarchive functionality
      //start by adding a button
      archive_button = document.createElement('button');

      //write text depending on current status
      if (email['archived']){
        archive_button.innerHTML = "Unarchive"
      } else {
        archive_button.innerHTML = "Archive"
      }
      
      //add an onclick function to swap archived between true and false
      archive_button.onclick = function () {

        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email['archived']
          })
        })

        //return user to a refreshed inbox when button is clicked
        location.reload();
        load_mailbox('inbox');
        
      }

      //add archive button to parent div
      div.appendChild(archive_button);

      //reply functionality
      //add a reply button
      reply_button = document.createElement('button');
      reply_button.innerHTML = 'Reply';

      //add onclick function to reply button that calls reply function
      //reply function is defined below
      reply_button.addEventListener('click', function(){reply(email)});

      //add reply button to parent div
      div.appendChild(reply_button);

      //write div to the details-view on site
      document.querySelector('#details-view').appendChild(div)

      //update email API to reflect read status
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false
        })
      })

  });

}

//the reply function switches the view to the compose-view and prefills relevant data
//reply is called from an onclick event in the details-view, defined above
function reply(email){

  // swap views to display the compose-view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#details-view').style.display = 'none';

  //prefill data with info from email
  document.querySelector('#compose-recipients').value = email['recipients'];
  document.querySelector('#compose-body').value = `On ${email['timestamp']} ${email['sender']} wrote ${email['body']}`;

  //don't double up on adding 'Re:' to the prefilled subject line
  if (email['subject'].substring(0,3) === 'Re:'){
    document.querySelector('#compose-subject').value = `${email['subject']}`
  } else {
    document.querySelector('#compose-subject').value = `Re: ${email['subject']}`
  }

}
