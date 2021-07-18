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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (document.querySelector('#email_display') != null){

    document.querySelector('#email_display').style.display = 'none';

  }  

  //acquire emails from API
   if (mailbox === 'inbox'){      
     // if (document.querySelector('#email_display') === null){
       // load_inbox()
     // }   
   }

}







function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })

}


function load_inbox(){

  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {

    let email_display = document.createElement('div')
    email_display.id = 'email_display'

    //loop through emails
    for (let i = 0; i < emails.length; i++){

      //define parent div      
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
      if (emails[i]['read'] === true){

        parent_div.style.backgroundColor = '#cccccc'
    
      } else {

        parent_div.style.backgroundColor = 'white'

      }

      //assign parent div ad id based on the email's id for future identification
      parent_div.id = emails[i]['id']

      //write parent div to body element
      email_display.appendChild(parent_div)
      //document.body.appendChild(parent_div)

    }

    document.body.appendChild(email_display)

  });



}
