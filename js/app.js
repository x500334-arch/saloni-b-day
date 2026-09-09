/* ==========================================================================
   Birthday Site Logic:
   1. Private Wishlist: Write-only to secure Supabase table (never read or rendered)
   2. Public Birthday Wishes: Live real-time stream via Supabase WebSockets
   ========================================================================== */

(function () {
  'use strict';

  // Base project URL (without /rest/v1/ suffix) and Publishable Key
  const SUPABASE_URL = 'https://wxsatxcenxcoxxrybheo.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_Dk6R0Cy_5l62L7PHA9YFXA_95MSlmCA';

  // Initialize Supabase client locally to avoid global name collisions
  let db = null;
  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase connected successfully');
    } else {
      console.error('❌ Supabase script not detected on window');
    }
  } catch (err) {
    console.error('❌ Error initializing Supabase client:', err);
  }

  // ---------- Toast helper ----------
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  // ---------- Nav dots active state ----------
  const sections = Array.from(document.querySelectorAll('main > section[id]'));
  const dots = Array.from(document.querySelectorAll('.nav-dots a'));
  function updateActiveDot() {
    let currentId = sections[0] ? sections[0].id : '';
    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4) currentId = sec.id;
    });
    dots.forEach((d) => d.classList.toggle('active', d.getAttribute('href') === '#' + currentId));
  }
  window.addEventListener('scroll', updateActiveDot);
  updateActiveDot();

  // ==========================================================================
  // 1. PRIVATE GIFT WISHLIST (STRICT WRITE-ONLY)
  // ==========================================================================
  const wishlistForm = document.getElementById('wishlist-form');

  if (wishlistForm) {
    wishlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!db) {
        showToast('Database is not connected. Please refresh the page!');
        return;
      }

      const submitBtn = wishlistForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const itemName = document.getElementById('gift-name').value.trim();
      const details = document.getElementById('gift-details').value.trim();
      const addedBy = document.getElementById('gift-by').value.trim();
      if (!itemName) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      try {
        const { error } = await db
          .from('gift_wishlist')
          .insert([{ item_name: itemName, details: details, added_by: addedBy }]);

        if (error) {
          if (error.code === '23505') {
            throw new Error('This gift idea is already on the list! 🎁');
          }
          throw error;
        }

        wishlistForm.reset();
        showToast('Secret gift idea sent securely! 🎁🔒');
        if (typeof window.fireConfetti === 'function') {
          window.fireConfetti(window.innerWidth / 2, window.innerHeight * 0.5, 60);
        }
      } catch (err) {
        console.error('Error saving gift idea:', err);
        showToast(err.message || 'Could not save gift idea. Please try again!');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // ==========================================================================
  // 2. PUBLIC BIRTHDAY WISHES (REAL-TIME WEBSOCKETS)
  // ==========================================================================
  const friendsForm = document.getElementById('friends-form');
  const friendsGrid = document.getElementById('friends-grid');
  const emojiPicker = document.getElementById('emoji-picker');
  let selectedEmoji = '🎉';

  if (emojiPicker) {
    emojiPicker.querySelectorAll('.emoji-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        emojiPicker.querySelectorAll('.emoji-choice').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedEmoji = btn.textContent.trim();
      });
    });
  }

  function renderFriendCard(item) {
    const div = document.createElement('div');
    div.className = 'friend-card';
    if (item.id) div.setAttribute('data-id', item.id);
    div.innerHTML =
      '<div class="friend-emoji">' + escapeHtml(item.emoji || '🎉') + '</div>' +
      '<div class="friend-name">' + escapeHtml(item.name || 'A Friend') + '</div>' +
      '<div class="friend-msg">' + escapeHtml(item.message) + '</div>';
    return div;
  }

  // Load existing wishes on startup
  async function loadFriendWishes() {
    if (!friendsGrid) return;
    if (!db) {
      friendsGrid.innerHTML = '<p class="empty-note">Could not connect to database.</p>';
      return;
    }

    try {
      // Order by id descending (newest first)
      let res = await db
        .from('friend_wishes')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);

      // Fallback if id column isn't ready
      if (res.error) {
        res = await db.from('friend_wishes').select('*').limit(100);
      }

      if (res.error) throw res.error;

      const rows = res.data || [];
      friendsGrid.innerHTML = '';
      if (rows.length === 0) {
        friendsGrid.innerHTML = '<p class="empty-note">No wishes yet — be the first to leave a birthday message! 💗</p>';
        return;
      }
      rows.forEach((row) => friendsGrid.appendChild(renderFriendCard(row)));
    } catch (err) {
      console.error('Error loading wishes:', err);
      friendsGrid.innerHTML = '<p class="empty-note">No wishes yet — be the first to leave a birthday message! 💗</p>';
    }
  }

  // Subscribe to live Realtime updates via Supabase WebSockets
  function subscribeToLiveWishes() {
    if (!db) return;
    try {
      db
        .channel('public:friend_wishes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'friend_wishes' },
          (payload) => {
            const newWish = payload.new;
            if (!friendsGrid) return;

            const emptyNote = friendsGrid.querySelector('.empty-note');
            if (emptyNote) emptyNote.remove();

            if (newWish.id && friendsGrid.querySelector(`[data-id="${newWish.id}"]`)) {
              return;
            }

            const card = renderFriendCard(newWish);
            friendsGrid.prepend(card);
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription failed, continuing in normal mode:', err);
    }
  }

  // Form submit handler
  if (friendsForm) {
    friendsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!db) {
        showToast('Database is not connected. Please refresh the page!');
        return;
      }

      const submitBtn = friendsForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const name = document.getElementById('friend-name').value.trim();
      const message = document.getElementById('friend-message').value.trim();
      if (!message) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      const payload = {
        name: name || 'A Friend',
        message: message,
        emoji: selectedEmoji
      };

      try {
        const { data, error } = await db
          .from('friend_wishes')
          .insert([payload])
          .select();

        if (error) {
          if (error.code === '23505') {
            throw new Error('A wish with this name already exists! Add your initial or another nickname.');
          }
          throw error;
        }

        friendsForm.reset();
        if (emojiPicker) {
          emojiPicker.querySelectorAll('.emoji-choice').forEach((b) => b.classList.remove('selected'));
          const first = emojiPicker.querySelector('.emoji-choice');
          if (first) first.classList.add('selected');
        }
        selectedEmoji = '🎉';

        showToast('Wish sent with love! 💗');
        if (typeof window.fireConfetti === 'function') {
          window.fireConfetti(window.innerWidth / 2, window.innerHeight * 0.5, 60);
        }

        if (data && data[0]) {
          const inserted = data[0];
          const emptyNote = friendsGrid.querySelector('.empty-note');
          if (emptyNote) emptyNote.remove();
          if (!friendsGrid.querySelector(`[data-id="${inserted.id}"]`)) {
            friendsGrid.prepend(renderFriendCard(inserted));
          }
        }
      } catch (err) {
        console.error('Error sending wish:', err);
        showToast(err.message || 'Could not send wish. Please try again!');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Initialize
  loadFriendWishes();
  subscribeToLiveWishes();
})();
