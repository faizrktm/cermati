/**
 *
 * @param {Date} dt2 dateTime 1
 * @param {Date} dt1 dateTime 2
 *
 * this function to calculate time remaining in minute
 */
function diffMinutes(dt2, dt1){
  let diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}

function isObject(data){
  return Object.keys(data).length === 0 && data.constructor === Object;
}

/**
 *
 * @param {string} name
 * this function is to get data from storage with given key
 * with checking if contain expired
 */
function getStorage(name) {
  let data = localStorage.getItem(name);
  data = JSON.parse(data);

  // if no storage found for certain key, return null;
  if(!data){
    return null;
  }

  if(isObject(data) && data.expires){
    const diffMinute = diffMinutes(new Date(), new Date(data.expires));

    // if not yet expires, return value
    if(diffMinute > 0){
      return data.value;
    }
    // if expired, return null
    return null;
  }

  return data.value;
}

/**
 *
 * @param {string} name key storage
 * @param {any} value value storage
 * @param {number} minute expires in minute
 *
 * It will set value of storage with given key,
 * and expired date based on given minute, default is 60 minute
 */
function setStorage(name, value, minute = 60) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minute);
  console.log(d);
  const expires = d.toUTCString();

  const storage = window.localStorage;
  storage.setItem(name, JSON.stringify({
    value: value,
    expires,
  }));
}

/**
 * This function is to get page height
 */
function getWindowHeight(){
  const body = document.body,
      html = document.documentElement;

  const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

  return height;
}

function initializeNewsletter(){
  const windowHeight = getWindowHeight();
  const minHeight = windowHeight / 3;
  let closed = false;

  const isStillClosed = getStorage('newsletter_closed', 10);

  /**
   * Show newsletter if arrived on 1/3 page,
   * or at bottom of screen if the screen is large enough
   * that almost consume all page
   */
  const listener = function(){
    if (
      document.body.scrollTop > minHeight
      || document.documentElement.scrollTop > minHeight
      || (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      if(!closed && !isStillClosed){
        document.getElementById('newsletter').classList.remove('newsletter__hidden');
        document.getElementById('newsletter').classList.add('newsletter__shown');
      }
    }
  }

  const close = function handleNewsletterClose(){
    // set closed on storage for next time check
    setStorage('newsletter_closed', 'true', 10);
    // set closed locally
    closed = true;
    document.getElementById('newsletter').classList.remove('newsletter__shown');
    document.getElementById('newsletter').classList.add('newsletter__hidden');
  }

  return {
    close,
    listener,
  }
}

/**
 * on initial load, get notification height, and set as jumbotron padding
 */
function setNotificationWrapperHeight(){
  const elHeight = document.getElementById('notification').offsetHeight;
  document.getElementById('jumbotron').style.paddingTop = elHeight + 'px';
}

/**
 * On notification button is clicked, hide notification and remove jumbotron padding
 */
function handleNotificationClick(){
  const elHeight = document.getElementById('notification').offsetHeight;
  document.getElementById('notification').style.transform = 'translateY(-' + elHeight + 'px)';
  document.getElementById('jumbotron').classList.add('jumbotron-hidden');
}

// initial setup on DOM ready
(function(){
  setNotificationWrapperHeight();
  const newsletter = initializeNewsletter();
  window.onscroll = newsletter.listener;

  document.getElementById('newsletter__close').addEventListener('click', newsletter.close);
  document.getElementById('notification__btn').addEventListener('click', handleNotificationClick);
})();
