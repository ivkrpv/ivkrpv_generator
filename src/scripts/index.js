import '@fortawesome/fontawesome-free/js/all';
import './gallery';
import './maps';
import './locale';
import './theme';

import { getUrlParameter, documentReady } from './utils';

documentReady(function () {
  // Init Bootstrap ooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Save images protection
  if (!getUrlParameter('save')) {
    $('body').on('contextmenu', 'img', function () {
      return false;
    });
  }
});
