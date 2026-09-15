/* flip-cards.js — click-to-flip tiles for the hobby sub-pages.
   Behaviour is identical to the project cards on the landing page:
     - a tile rotates only when it is clicked; hovering never rotates it
     - opening a tile returns every other tile to its original position
   The hobby pages use three class conventions, all handled here:
     .flip-card           + .flipped      (Food)
     .flip-card-container + .is-flipped   (courses)
     .inventory-flip-card + .flipped      (Coins, Puzzle)
   Inline handlers call window.toggleHobbyFlip(this, event).
   The 3D rotation itself stays in each page's CSS; this file only manages
   which tile is open. Progressive enhancement: without this file the tiles
   still render normally (they simply never rotate). */
(function () {
  'use strict';

  var TILE_SEL = '.flip-card-container, .flip-card, .inventory-flip-card';
  var INTERACTIVE = 'a, button, input, textarea, select, label';

  function tiles() {
    return document.querySelectorAll(TILE_SEL);
  }

  /* .flip-card-container uses .is-flipped; the other two use .flipped. */
  function stateClass(tile) {
    return tile.classList.contains('flip-card-container') ? 'is-flipped' : 'flipped';
  }

  /* Return every tile except `keep` to its original (unrotated) position. */
  function closeOthers(keep) {
    var list = tiles();
    for (var i = 0; i < list.length; i++) {
      if (list[i] === keep) continue;
      list[i].classList.remove('flipped');
      list[i].classList.remove('is-flipped');
    }
  }

  /* Rotate `tile` on click; clicking an open tile closes it again. */
  window.toggleHobbyFlip = function (tile, event) {
    if (!tile || !tile.classList) return;
    var target = event && event.target;
    // links/buttons inside a tile keep their own behaviour
    if (target && target.closest && target.closest(INTERACTIVE)) return;
    closeOthers(tile);
    tile.classList.toggle(stateClass(tile));
  };

  /* Safety net: runs in the capture phase, before any tile's own handler, so
     even a tile that still carries an old inline toggle cannot leave another
     tile open. */
  document.addEventListener('click', function (event) {
    var target = event.target;
    var tile = target && target.closest ? target.closest(TILE_SEL) : null;
    if (tile) closeOthers(tile);
  }, true);
})();