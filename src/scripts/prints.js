const printOrder = {
  url: null,
  frame: 'dark',
  size: '61x91',
  email: null,
  contact: null,
};

function toggleModalLoading(loading) {
  if (loading) {
    $('.js-print-order').prop('disabled', true).children('.spinner-border').removeClass('d-none');
  } else {
    $('.js-print-order').prop('disabled', false).children('.spinner-border').addClass('d-none');
    $('#newOrderModal').modal('hide');
  }
}

export default () => {
  const prints$ = $('#prints');
  const printsTags$ = $('#printsTags');

  $('body').on('click', '.print-frame-thumb', function () {
    printsTags$.hide();
    $(this).removeClass('print-frame-thumb').siblings().hide();
    $('.js-print-dashboard').toggleClass('d-none d-flex');

    printOrder.url = $(this).find('img').prop('src');
  });

  $('body').on('click', '.js-print-cancel', function () {
    printsTags$.show();
    $('.print-frame').addClass('print-frame-thumb');
    prints$.children().show();
    $('.js-print-dashboard').toggleClass('d-none d-flex');

    // clear print order url
    printOrder.url = null;

    // clear invalid order form fields
    $('.js-print-order-form .form-control:invalid').val('');
    $('.js-print-order-form').removeClass('was-validated');
  });

  $('body').on('click', '.js-print-frame', function (e) {
    const $btn = $(e.currentTarget);
    const color = $btn.data('color'); // light or dark

    $('.print-frame').removeClass('print-frame-light print-frame-dark').addClass('print-frame-' + color);

    printOrder.frame = color;
  });

  $('body').on('click', '.js-print-bg', function (e) {
    const $btn = $(e.currentTarget);
    const color = $btn.data('color'); // any bootstrap color
    const darkText = color === 'light' || color === 'warning';
    const textColor = darkText ? 'dark' : 'white';
    const navbarBg = darkText ? 'light' : 'dark';
    const likelyColor = darkText ? 'light' : 'dark';

    $('body')
      .removeClass(function (index, className) {
        return (className.match(/(^|\s)bg-\S+/g) || []).join(' ');
      })
      .addClass('bg-' + color);

    $('body').removeClass('text-white text-dark').addClass('text-' + textColor);
    $('.navbar').removeClass('navbar-light navbar-dark').addClass('navbar-' + navbarBg);
    $('.likely').removeClass('likely-light likely-dark').addClass('likely-' + likelyColor);
  });

  $('body').on('change', '.js-print-size input[type=radio][name=size]', function () {
    printOrder.size = $(this).val();

    $('.js-print-price').children().addClass('d-none');
    $(`.js-print-price [data-lcl=price${printOrder.size}]`).removeClass('d-none');
  });

  $('body').on('click', '.js-print-order', function () {
    $('.js-print-order-form').submit();
  });

  $('body').on('submit', '.js-print-order-form', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $form = $(this);

    $form.addClass('was-validated');

    if (this.checkValidity() !== false) {
      $form.serializeArray().forEach(f => {
        printOrder[f.name] = f.value;
      });

      toggleModalLoading(true);

      $.ajax({
        url: 'https://script.google.com/macros/s/AKfycbxC1Z2rtuymmvZt0J6si52IqNe_qlduBbplSxxXcDtnQvLrAW0/exec',
        method: 'GET',
        dataType: 'json',
        data: printOrder,
        success: function () {
          toggleModalLoading(false);

          $('#newOrderSuccess').removeClass('d-none').toast({
            delay: 3000,
          }).toast('show');
        },
        error: function () {
          toggleModalLoading(false);

          $('#newOrderError').removeClass('d-none').toast({
            delay: 3000,
          }).toast('show');
        },
      })
    }
  });
}
