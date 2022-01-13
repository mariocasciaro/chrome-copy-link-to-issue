(function() {
  if (window.isAlreadyPrepared) return;
  window.isAlreadyPrepared = true;
  chrome.runtime.onMessage.addListener(function(request) {
    if (!!request.format) {
      copy(request.format);
    }
  });

  function copy(format) {
    if (format === 'htmlElement') {
      return execCopyAsElement();
    }

    return execCopyAsString(getFormattedIssueLink(format));
  }

  function execCopyAsElement() {
    var data = getIssueData();
    var element = document.createElement('a');
    element.style.cssText = 'position:absolute;left:-100%;';
    element.href = data.url;

    document.body.appendChild(element);

    element.textContent = data.text;
    var range = document.createRange();
    range.selectNode(element);
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    window.getSelection().removeAllRanges();// to deselect

    document.body.removeChild(element);
  }

  function execCopyAsString(text) {
    var textArea = document.createElement('textarea');
    textArea.style.cssText = 'position:absolute;left:-100%;';

    document.body.appendChild(textArea);

    textArea.value = text;
    textArea.select();
    document.execCommand('copy');

    document.body.removeChild(textArea);
  }

  function getIssueData() {
    var h1 = 'h1.gh-header-title';
    var title = document.querySelectorAll(`${h1} .js-issue-title`)[0].innerText.trim();
    var num = document.querySelectorAll(`${h1} .f1-light`)[0].innerText;
    var url = window.location.href;
    var type = isPullRequestUrl(url) ? '(Pull request)' : '';

    return {
      text: `${type} ${title} ${num}`,
      url: url
    };
  }

  function getFormattedIssueLink(format) {
    var data = getIssueData();

    switch (format) {
      case 'markdown':
        return `[${data.text}](${data.url})`;
      case 'htmlString':
        return `<a href="${data.url}">${data.text}</a>`;
      case 'plain':
        return `${data.text}\n${data.url}`;
    }
    return '';
  }

  function isPullRequestUrl(url) {
    return /^https:\/\/github.com\/(.+)\/(.+)\/pull\/(\d+)/.test(url)
  }
})();

