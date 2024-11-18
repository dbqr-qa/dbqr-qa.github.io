const error_message = "An error has occurred. Please check your browser's console for more information.";
var host;
var branch;

function initHost() {
  if (window.location.toString().startsWith('https://dbqr-qa.github.io/')) {
    host = 'https://chez.my/';
  } else {
    host = 'http://127.0.0.1:5000/';
  }
}

function initBranch() {
  if (typeof(Storage) !== 'undefined') {
    branch = localStorage.getItem('branch');

    if (branch === null) {
      branch = 'master';
    }

    $('#branch-selector').val(branch);
  }
}

function formatScore(score) {
  if (typeof score === 'number') {
    return score.toFixed(2);
  } else {
    return score;
  }
}

function renderBoard(stage, records) {
  const parent = $('#lead-' + stage + '-tab-pane');
  const table = $($('#board-template').html());
  
  const body = table.find('tbody');

  for (let i = 0; i < records.length; i++) {
    const tr = $('<tr>');
    const record= records[i];

    tr.append($('<td>').html(record['name']))
      .append($('<td>').html(record['entries']))
      .append($('<td>').html(formatScore(record['graderScore'])))
      .append($('<td>').html(formatScore(record['gptScore'])))
      .append($('<td>').html(formatScore(record['humanScore'])))
      .append($('<td>').html(record['last']))
    
    body.append(tr);
  }

  parent.empty().append(table);
}

function loadBoard() {
  $.get({
    'url': host + 'dbqr-qa/leaderboard?branch=' + branch,
    success: function(data) {
      if (data.status === 'ok') {
        renderBoard('practice', data.scores[branch].practice);
        renderBoard('training', data.scores[branch].training);
        renderBoard('test', data.scores[branch].test);

      } else if (data.status === 'error') {
        alert(data.message);
      }
    }
  })
  .fail(function() {
    alert(error_message);
  });
}

function changeBranch() {
  branch = $('#branch-selector').val();
  loadBoard();

  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem('branch', branch);
  }
}

$(document).ready(function() {
  initHost();
  initBranch();
  loadBoard();

  $('#branch-selector').on('change', changeBranch);
});
