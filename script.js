import './normal.css';
import bot from './assets/bot.svg'
import user from './assets/user.svg'

// get the form and chat container from the DOM
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelector('nav .nav-items');
const toggle = document.querySelector('.sidebar .toggle');
const toggleIcon = document.querySelector('.sidebar .toggle .bx-chevron-right');


// add an event listener to the toggle button
toggle.addEventListener('click', () => {
  // toggle the sidebar
  if ( sidebar.className === "sidebar" )
  {
    sidebar.classList.add("open");
    toggleIcon.classList.add('bx-rotate-180');

    removeToggleHoverAnimation();
  }
  else
  {
    sidebar.classList.remove("open");
    toggleIcon.classList.remove('bx-rotate-180');

    removeToggleHoverAnimation();
  }
});


// add an event listener to the toggle button when the user hovers
toggle.addEventListener('mouseover', () => {
  // play the animation
  if ( toggle.classList.contains("toggle") && !sidebar.classList.contains('open'))
  {
    addToggleHoverAnimation();
  }
});
// add an event listener to the toggle button when the user unhovers, remove the animation
toggle.addEventListener('mouseout', () => {
  removeToggleHoverAnimation();
});



/**
 * This function is called when the form is submitted. Displays a animated loader and sends the message to the server.
 * @param {*} element - the element to add the loader to animate the loading 
*/
let loadInverval;
function loader(element){
  element.textContent = '';

  // add a dot every 300ms
  loadInverval = setInterval(() => {
    element.textContent += '.';

    // if the dot is the 3rd one, reset the text
    if(element.textContent.length === 4){
      element.textContent = '';
    }
  }, 300);
}


/**
 * Displays the chatGPT response in the chat container, one character at a time. Then removes the loader.
 * @param {*} text - the text to display
 * @param {*} element - the element to display the text in
 */
function typeText(text, element){
  let i = 0;

  const interval = setInterval(() => {
    
    if(i < text.length){
      element.innerHTML += text.charAt(i);
      i++;
    }
    // if the text is finished, clear the interval
    else{
      clearInterval(interval);
    }
  }, 20);
}


/**
 * Generates a unique id for each the chat message
 */
function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

/**
 * Creates a chat div with the user image and message or the bot image and response.
 * @param {*} isAi - true if the message is from the bot
 * @param {*} value - the message or response
 * @param {*} uniqueId - the unique id for the message or response
 * @returns the chat div
 */
function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}" 
              alt="${isAi ? 'bot' : 'user'}" 
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  // prevent the default behaviour of the form. 
  // This is to prevent the page from reloading when the form is submitted.
  e.preventDefault();

  // get the message from the form
  const message = new FormData(form);

  // generate the user's chatstripe
  chatContainer.innerHTML += chatStripe(false, message.get('prompt'));

  // clear the form
  form.reset();


  /** bot's chatstripe response to the user's message */

  // generate a unique id for the message
  const uniqueId = generateUniqueId();

  // add the message to the chat container
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // scroll to the bottom of the chat container
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // get the message element from the DOM
  const messageElement = document.getElementById(uniqueId);

  // display the loader
  loader(messageElement);

  // send the message to the server -> chatGPT response
  const response = await fetch('https://gpt-server.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: message.get('prompt')
      // prompt: 'hello'
    })
  });

  // remove the loader
  clearInterval(loadInverval);

  // clear the message element
  messageElement.innerHTML = ' ';
  
  if (response.ok) {
    // get the response from the server
    const data = await response.json();

    // parse the response
    const bot = data.bot.trim();
    
    // display the response
    typeText(bot, messageElement);
    
  } else {
    // get the error from the server
    const err = await response.text();

    // display a generic error message in the chat container
    messageElement.innerHTML = `Something went wrong. Please try again later.
    ${await err}
    `;

    // display the error
    alert(err);
  }
}

// add an event listener to the form
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13){
    handleSubmit(e);
  }
});


//* ----- Toggle button hover animations ----- *//
let count = 0; let hoverInterval;
/**
 * This function is called when the user hovers over the toggle button. 
 * It adds the hover animation to the toggle button.
 */
function removeToggleHoverAnimation()
{
  clearInterval(hoverInterval);
  count = 0;
  if ( toggle.className === "toggle hover" )
  {
    toggle.classList.remove('hover');
    toggle.classList.add('unhover')
  }
}


/**
 * This function is called when the user stops hovering over the toggle button.
 * It removes the hover animation from the toggle button.
 */
function addToggleHoverAnimation()
{
    // add hover animation and after .8s remove the animation
    hoverInterval = setInterval(() => {
      const removeCount = 8;
      // if the count is 0, add the animation
      if ( count === 0 )
      {
        toggle.classList.remove('unhover');
        toggle.classList.add('hover');
      }

      // increment the count
      count++;
      
      // if the count reaches removeCount, remove the animation
      if ( count === removeCount )
      {
        toggle.classList.remove('hover');
        toggle.classList.add('unhover');
      }
       // if the count reaches double the removeCount, reset the count
      if ( count === removeCount*1.5 )
      {
        count = 0;
      }
    }, 100);
}