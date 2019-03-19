'use strict';

// these 'replace and compile' methods are for replacing {{whitelabel.XXX}} and {{#link}} variables in static pages and faqs
// the text is pulled from the pages/faqs table in the database
// REPROCESS AND LINK HELPERS NOW HANDLE WHAT THIS GUY USED TO
const brokenLinkPattern = /\{\{#link ([\w/-]+)\}\}/g;
const brokenLinkFix = (match, path) => '{{#link "' + path + '"}}';

function replaceBadLinks (pageInfo, variant, whitelabelInfo) {
  for (var k in pageInfo) {
    if (typeof pageInfo[k] === 'string') {
      pageInfo[k] = pageInfo[k].replace(brokenLinkPattern, brokenLinkFix);
    }
  }
}

function replaceFaqsBadLinks (faqList, variant, whitelabelInfo) {
  for (var faq in faqList) {
    for (var entry in faqList[faq].entries) {
      if (typeof faqList[faq].entries[entry].answer === 'string') {
        faqList[faq].entries[entry].question = faqList[faq].entries[entry].question.replace(brokenLinkPattern, brokenLinkFix);
        faqList[faq].entries[entry].answer = faqList[faq].entries[entry].answer.replace(brokenLinkPattern, brokenLinkFix);
      }
    }
  }
}

module.exports = {
  replaceBadLinks: replaceBadLinks,
  replaceFaqsBadLinks: replaceFaqsBadLinks
};
