import '@fortawesome/fontawesome-free/js/all';
import gallery from './gallery';
import maps from './maps';
import './locale';

import { getUrlParameter } from './utils';

$(function () {
  // Tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Save images protection
  if (!getUrlParameter('save')) {
    $('body').on('contextmenu', 'img', function () {
      return false;
    });
  }

  // Old modules
  gallery();
  maps();
  // prints();
});
