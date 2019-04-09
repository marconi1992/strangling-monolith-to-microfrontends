const cheerio = require('cheerio');
const axios = require('axios');
 
const DATA_KEY = 'hypernova-key';
const DATA_ID = 'hypernova-id';

const LEFT = '<!--';
const RIGHT = '-->';

const makeValidDataAttribute = (attr, value) => {
  const encodedAttr = attr.toLowerCase().replace(/[^0-9a-z_-]/g, '');
  const encodedValue = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `data-${encodedAttr}="${encodedValue}"`;
}

const makeSelectors = (uuid, key) => {
  const attrs = {
    [DATA_ID]: uuid,
    [DATA_KEY]: key
  }

  return  Object.keys(attrs)
    .map(name => `[${makeValidDataAttribute(name, attrs[name])}]`)
    .join('');
}

const hypernova = async (body) => {
  const $ = cheerio.load(body);

  const jobs = {};

  $('div[data-hypernova-key]').each(function () {
    const el = $(this);
    const uuid = el.data(DATA_ID);
    const key = el.data(DATA_KEY);

    if (!uuid || !key) {
      return;
    }

    const selectors = makeSelectors(uuid, key);

    const script = $(`script${selectors}`);

    if (!script.length) {
      return; 
    }

    const jsonPayload = script.html();
    
    const json = jsonPayload.slice(LEFT.length, jsonPayload.length - RIGHT.length);

    const data = JSON.parse(json);

    jobs[uuid] = {
      name: key,
      data
    };
  });

  const { data } = await axios.post('http://hypernova:3000/batch', jobs);
  const results = data.results || {}

  Object.keys(results).forEach((uuid) => {
    const result = results[uuid]
    const { name: key } = result

    if (result.success) {
      const selectors = makeSelectors(uuid, key);

      $(`script${selectors}`).remove();
      $(`div${selectors}`).replaceWith(result.html);
    }
  });

  return $.html();
}
 
module.exports = hypernova