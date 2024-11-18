const error_message = "An error has occurred. Please check your browser's console for more information.";
var activated = false;
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

function initToken() {
  if (typeof(Storage) !== 'undefined') {
    token = localStorage.getItem('token');

    if (token !== null && token.length > 0) {
      $('#token-input').val(token);
      activate();
    }
  }
}

function formatScore(score) {
  if (typeof score === 'number') {
    return score.toFixed(2);
  } else {
    return score;
  }
}

function saveToken(token) {
  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

function activate() {
  let token = $('#token-input').val();
  var data = {token: token};

  $('#token-input').prop('disabled', true);
  $('#activate-button').prop('disabled', true);
  $('#activate-spinner').css('display', 'inline-block');
  
  $.get({
    'url': host + 'dbqr-qa/activate',
    data: data,
    dataType: 'json',
    success: function(data) {
      if (data.status === 'ok') {
        $('#activate-button').hide();
        $('#deactivate-button').show();
        $('#username').html(data.account.display);
        $('#submission').show();
        $('#history').show();

        activated = true;
        saveToken(token);

        fetchHistory(1, false);

      } else if (data.status === 'error') {
        $('#token-input').prop('disabled', false);
        $('#activate-button').prop('disabled', false);
        activated = false;
        alert(data.message);
      }

      $('#activate-spinner').hide();

    }})
    .fail(function() {
      $('#token-input').prop('disabled', false);
      $('#activate-button').prop('disabled', false);
      $('#activate-spinner').hide();
      activated = false;
      alert(error_message);
    }
  );
}

function deactivate() {
  $('#token-input').prop('disabled', false).val('');
  $('#activate-button').prop('disabled', false).show();
  $('#deactivate-button').hide();
  $('#submission').hide();
    $('#history').hide();

  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem('token', '');
    activated = false;
  }
}

function disableInput() {
  $('.btn').addClass('disabled');
  $('.page-item').addClass('disabled');
}

function enableInput() {
  $('.btn').removeClass('disabled');
  $('.page-item').removeClass('disabled');
}

function submit() {
  var data = new FormData();

  data.append('token', $('#token-input').val());
  data.append('file', $('#submit-file')[0].files[0]);
  data.append('branch', branch);
  
  $('#submit-spinner').css('display', 'inline-block');
  disableInput();

  $.post({
    'url': host + 'dbqr-qa/submit',
    data: data,
    processData: false,
    contentType: false,
    dataType: 'json',
    success: function(data) {
      if (data.status === 'ok') {
        fetchHistory(1, true);

        $('#submit-button').hide();
        $('#submit-file').val('');
        $('#submit-spinner').hide();
        enableInput();
        
        $('#complete-button').show().click(function() {
          $('#complete-button').hide();
          $('#submit-button').show();
        });

      } else if (data.status === 'error') {
        $('#submit-spinner').hide();
        enableInput();
        alert(data.message);
      }
    }
  })
  .fail(function() {
    $('#submit-spinner').hide();
    enableInput();
    alert(error_message);
  });
}

function fetchHistory(page, isSubmission) {
  const token = $('#token-input').val();
  const table = $('#history tbody');
  const params = {
    token: token,
    branch: branch,
    page: page}

  disableInput();

  $.get({
    'url': host + 'dbqr-qa/history',
    data: params,
    dataType: 'json',
    success: function(data) {
      if (data.status === 'ok') {
        table.empty();

        for (let i = 0; i < data.history.length; i++) {
          const record = data.history[i];
          const row = $('<tr>');

          row.append($('<td>').html(record.entry))
            .append($('<td>').html(record.submitted))
            .append($('<td>').html(record.stage))
            .append($('<td>').html(record.status))
            .append($('<td>').html(formatScore(record.graderScore)))
            .append($('<td>').html(formatScore(record.gptScore)))
            .append($('<td>').html(formatScore(record.humanScore)))
            .append($('<td>').append(
              $('<a href="' + host + 'dbqr-qa/download?token=' + token + '&branch=' + branch + '&timestamp=' + record.timestamp + '">').html('View')
            ));

          table.append(row);

        }

        const pages = $('#history-pages');
        pages.empty();

        const previous = $('<li class="page-item">').append(
          $('<a class="page-link" href="#history">')
            .html("Previous")
            .click(function() {
              if (data.page > 1) {
                fetchHistory(data.page - 1, false);
              } else {
                fetchHistory(1, false);
              }
            }));

        pages.append(previous);

        for (let i = 1; i <= data.pageCount; i++) {
          const item = $('<li class="page-item">').append(
            $('<a class="page-link" href="#history">')
              .html(i)
              .click(function() {
                fetchHistory(i, false);
              }));

          if (i === data.page) {
            item.addClass('active');
          }

          pages.append(item);
        }

        const next = $('<li class="page-item">').append(
          $('<a class="page-link" href="#history">')
            .html("Next").
            click(function() {
              if (data.page < data.pageCount) {
                fetchHistory(data.page + 1, false);
              } else {
                fetchHistory(data.pageCount, false);
              }
            }));

        pages.append(next);

        if (isSubmission) {
          $('#history').addClass('complete');
        } else {
          $('#history').removeClass('complete');
        }

        $('#quota').html(data.remaining);
        enableInput();
        
      } else if (data.status === 'error') {
        enableInput();
        alert(data.message);
      }
    }
  })
  .fail(function() {
    enableInput();
    alert(error_message);
  });
}

function changeName() {
  var name = prompt('Enter a new display name:');

  if (name) {
    const params = {
      token: $('#token-input').val(),
      name: name}
  
    $('#name-change-spinner').css('display', 'inline-block');
    disableInput();

    $.post({
      'url': host + 'dbqr-qa/username',
      data: params,
      dataType: 'json',
      success: function(data) {
        if (data.status === 'ok') {
          alert('Successfully changed your display name to ' + data.name);
          $('#username').html(data.name);

          $('#name-change-spinner').hide();
          enableInput();

        } else if (data.status === 'error') {
          $('#name-change-spinner').hide();
          enableInput();
          alert(data.message);
        }
      }
    })
    .fail(function() {
      $('#name-change-spinner').hide();
      enableInput();
      alert(error_message);
    });
  }
}

function changeBranch() {
  branch = $('#branch-selector').val();
  fetchHistory(1, false);

  if (typeof(Storage) !== 'undefined') {
    localStorage.setItem('branch', branch);
  }
}

$(document).ready(function() {
  initHost();
  initBranch();
  initToken();

  $('#activate-button').click(activate);
  $('#deactivate-button').click(deactivate);
  $('#submit-button').click(submit);
  $('#name-change-button').click(changeName);
  $('#branch-selector').on('change', changeBranch);
});
