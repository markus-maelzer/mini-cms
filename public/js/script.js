$(document).ready(function () {
  var serverData;
  getData();
  function getData() {
    $.get('data', function (data, status) {
      serverData = data;
      if(serverData) {
        for (var i = 0; i < serverData.length; i++) {
          console.log('hi');
          $('.data').append('<div class="person" data-id="'+ serverData[i].id +
          '"><input value="'+ serverData[i].name + '" class="name">' +
          '<div class="img_container">'+
          '<form class="form" action = "http://localhost:3000/upload" method="post" enctype="multipart/form-data">'+
          '<input type="file" name="file" size="50" /><br /><input type = "submit" value = "Upload File" /><p>x</p></form>'+
          '<img class="img" src="/' + serverData[i].image +
          '" alt="image" /></div>'+
          '<textarea class="notizen">'+ serverData[i].notizen + '</textarea>');
        }
      }
    })
  }

  var status = true;
  $(document).on('click', '.img_container', function () {
    if (status) {
      $(this).find('.form').addClass('show');
      status = false;
    }
  })
  $(document).on('click', '.img_container p', function () {
    if(!status) {
      $(this).parent().removeClass('show');
      setTimeout(function () {
        status = true;
      },100)
    }
  })
  $(document).on('submit', '.form', function (e) {
    e.preventDefault();
    var form = $(this)[0];
    var formData = new FormData(form);
    var id = $(this).parent().parent().data('id');
    $.ajax({
      url: 'upload',
      data: formData,
      type: 'post',
      contentType: false,
      processData: false,
    });
    socket.emit('image uploaded', id);
  })

  var socket = io();
  socket.on('success', function (val) {
    if(val.text === 'notes') {
      $('.person[data-id='+ val.id +'] .notizen').removeClass('red');
    } else if(val.text === 'name') {
      $('.person[data-id='+ val.id +'] .name').removeClass('red');
    }
  })

  $(document).on('keydown', '.notizen, .name', function () {
    console.log('sad');
    $(this).addClass('red');
  })
  $(document).on('change', '.notizen', function (e) {
    var id= $(this).parent().data('id');
    var value = $(this).val();
    var data = {
      value: value,
      id: id,
    }
    socket.emit('changeNotes', data);
  });
  $(document).on('change', '.name', function (e) {
    var id= $(this).parent().data('id');
    var value = $(this).val();
    var data = {
      value: value,
      id: id,
    }
    socket.emit('changeName', data);
  });


})
