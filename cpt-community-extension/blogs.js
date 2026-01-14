function collapseMessages(root = document) {
  // Unique prefix to avoid conflicts with other extensions
  const PREFIX = 'cpt-community-';
  const STYLE_ID = PREFIX + 'collapse-styles';
  const DATA_DESCENDANTS_ATTR = 'data-' + PREFIX + 'descendants';
  const COLLAPSED_CLASS = PREFIX + 'comment-collapsed';
  const THREAD_COLLAPSED_CLASS = PREFIX + 'comment-thread-collapsed';
  const BUTTON_CLASS = PREFIX + 'comment-collapse-btn';
  
  // Style constants
  const FONT_SIZE = '12px';
  const COLOR_TEXT = '#6c757d';
  const COLOR_TEXT_HOVER = '#495057';
  const COLOR_COUNT = '#007bff';
  const COLOR_BG = '#f8f9fa';
  const COLOR_BG_HOVER = '#e9ecef';
  const COLOR_BORDER = '#dee2e6';
  const MARGIN_LEFT = '5px';
  const PADDING_VERTICAL = '2px';
  const PADDING_HORIZONTAL = '6px';
  const BORDER_RADIUS = '3px';
  const TRANSITION_DURATION = '0.2s';
  
  // Check if styles already added to avoid duplicates
  if (!root.getElementById(STYLE_ID)) {
    try {
      const style = root.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
          .${PREFIX}comment-collapse-btn {
              display: inline-block;
              cursor: pointer;
              user-select: none;
              font-size: ${FONT_SIZE};
              color: ${COLOR_TEXT};
              margin-left: ${MARGIN_LEFT};
              padding: ${PADDING_VERTICAL} ${PADDING_HORIZONTAL};
              border-radius: ${BORDER_RADIUS};
              background-color: ${COLOR_BG};
              border: 1px solid ${COLOR_BORDER};
              transition: all ${TRANSITION_DURATION};
          }
          .${PREFIX}comment-collapse-btn:hover {
              background-color: ${COLOR_BG_HOVER};
              color: ${COLOR_TEXT_HOVER};
          }
          .${PREFIX}comment-collapse-btn.collapsed::before {
              content: '▶ ';
          }
          .${PREFIX}comment-collapse-btn.expanded::before {
              content: '▼ ';
          }
          .${PREFIX}comment-collapsed {
              display: none !important;
          }
          .${PREFIX}comment-replies-count {
              font-weight: bold;
              color: ${COLOR_COUNT};
          }
      `;
        // Use root.head with fallback to document.head
        (root.head || document.head).appendChild(style);
      } catch (e) {
        console.error('[CPT Community Extension] Failed to add styles:', e);
      }
    }

    // Function to get all child comments
    const getChildComments = function(commentElement) {
      const commentLevel = parseInt(commentElement.getAttribute('data-level') || '0');
      const children = [];
      
      // Find the next comment element
      let nextElement = commentElement.nextElementSibling;
      while (nextElement) {
        // Skip non-comments
        if (nextElement.nodeType === 1 && nextElement.classList.contains('comment')) {
          const nextLevel = parseInt(nextElement.getAttribute('data-level') || '0');
          
          // If level is less than or equal - not a descendant, stop searching
          if (nextLevel <= commentLevel) {
            break;
          }
          
          // If level is exactly 1 greater - this is a direct child
          if (nextLevel === commentLevel + 1) {
            children.push(nextElement);
          }
          // If level is more than 1 greater - this is a descendant of one of our descendants,
          // skip it, it will be processed recursively
        }
        nextElement = nextElement.nextElementSibling;
      }
      
      return children;
    };

    // Recursive function to get all descendants
    const getAllDescendants = function(commentElement) {
      const children = getChildComments(commentElement);
      return children.reduce((acc, child) => {
        acc.push(child);
        acc.push(...getAllDescendants(child));
        return acc;
      }, []);
    };

    // Function to get correct declension of "комментарий"
    const getCommentWord = function(count) {
      const mod10 = count % 10;
      const mod100 = count % 100;
      
      // 11, 12, 13, 14 use genitive plural
      if (mod100 >= 11 && mod100 <= 14) {
        return 'комментариев';
      }
      
      // 1 uses nominative singular
      if (mod10 === 1) {
        return 'комментарий';
      }
      
      // 2, 3, 4 use genitive singular
      if (mod10 >= 2 && mod10 <= 4) {
        return 'комментария';
      }
      
      // 0, 5-9 use genitive plural
      return 'комментариев';
    };

    // Helper function to toggle descendant visibility
    const toggleDescendants = function(descendantIds, isCollapsed) {
      descendantIds.forEach(id => {
        try {
          const elem = root.getElementById(id);
          if (elem) {
            elem.classList.toggle(COLLAPSED_CLASS, !isCollapsed);
          }
        } catch (err) {
          // Ignore errors for individual elements
        }
      });
    };

    // Function to add collapse button
    const addCollapseButton = function(commentElement) {
      if (!commentElement || commentElement.nodeType !== 1) {
        return;
      }

      try {
        const descendants = getAllDescendants(commentElement);
        
        if (descendants.length === 0) {
          return; // No replies, don't add button
        }

        // Check if button is already added
        if (commentElement.querySelector('.' + BUTTON_CLASS)) {
          return;
        }

        const controls = commentElement.querySelector('.icms-comment-controls');
        if (!controls) return;

        const button = root.createElement('span');
        button.className = BUTTON_CLASS + ' expanded';
        
        // Use textContent for safety instead of innerHTML
        const countSpan = root.createElement('span');
        countSpan.className = PREFIX + 'comment-replies-count';
        countSpan.textContent = descendants.length;
        button.appendChild(countSpan);
        button.appendChild(root.createTextNode(' ' + getCommentWord(descendants.length)));
        button.title = 'Свернуть/развернуть комментарии';
        
        // Save list of descendants in data attribute with unique prefix
        const descendantIds = descendants.map(c => c?.id).filter(Boolean);
        if (descendantIds.length > 0) {
          commentElement.setAttribute(DATA_DESCENDANTS_ATTR, descendantIds.join(','));
        }
        
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          try {
            const isCollapsed = commentElement.classList.contains(THREAD_COLLAPSED_CLASS);
            const descendantsAttr = commentElement.getAttribute(DATA_DESCENDANTS_ATTR);
            const descendantIds = descendantsAttr ? descendantsAttr.split(',').filter(Boolean) : [];
            
            // Toggle collapsed state
            commentElement.classList.toggle(THREAD_COLLAPSED_CLASS, !isCollapsed);
            button.classList.toggle('collapsed', !isCollapsed);
            button.classList.toggle('expanded', isCollapsed);
            
            // Toggle descendant visibility
            toggleDescendants(descendantIds, isCollapsed);
          } catch (err) {
            console.error('[CPT Community Extension] Error in collapse handler:', err);
          }
        });
        
        // Safe button insertion
        controls.insertBefore(button, controls.firstChild);
      } catch (e) {
        console.error('[CPT Community Extension] Error adding collapse button:', e);
      }
    };

    // Function to process all comments
    const processComments = function() {
      try {
        const commentsList = root.getElementById('comments_list');
        if (!commentsList) return;

        const comments = commentsList.querySelectorAll('.comment');
        
        // Process comments in reverse order to process parent comments first
        for (let i = comments.length - 1; i >= 0; i--) {
          addCollapseButton(comments[i]);
        }
      } catch (e) {
        console.error('[CPT Community Extension] Error processing comments:', e);
      }
    };

    // Start processing on page load
    try {
      if (root.readyState === 'loading') {
        root.addEventListener('DOMContentLoaded', processComments);
      } else {
        processComments();
      }

      // Process new comments added dynamically
      const observer = new MutationObserver(function(mutations) {
        try {
          const hasNewComments = mutations.some(mutation => 
            Array.from(mutation.addedNodes).some(node => 
              node.nodeType === 1 && node.classList && 
              (node.classList.contains('comment') || node.querySelector('.comment'))
            )
          );
          
          if (hasNewComments) {
            setTimeout(processComments, 100);
          }
        } catch (e) {
          console.error('[CPT Community Extension] Error in MutationObserver:', e);
        }
      });

      const commentsList = root.getElementById('comments_list');
      if (commentsList) {
        observer.observe(commentsList, {
          childList: true,
          subtree: true
        });
      }
    } catch (e) {
      console.error('[CPT Community Extension] Error initializing:', e);
    }
}

(function initBlogsPage() {
  collapseMessages(document);
})();

