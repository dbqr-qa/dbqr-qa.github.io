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

  parent.append(table);
  console.log(table);
}

function loadBoard() {
  $.get({
    'url': 'https://chez.my/dbqr-qa/leaderboard',
    success: function(data) {
      if (data.status === 'ok') {
        renderBoard('practice', data.scores.practice);
        renderBoard('training', data.scores.training);
        renderBoard('test', data.scores.test);
        console.log(data);

      } else if (data.status === 'error') {
        alert(data.message);
      }
    }
  })
  .fail(function() {
    alert(error_message);
  });
}

$(document).ready(function() {
    loadBoard();
});
