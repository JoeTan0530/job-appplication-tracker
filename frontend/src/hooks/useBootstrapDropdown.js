// hooks/useBootstrapDropdown.js
import { useEffect, useRef, useState, useCallback } from 'react';

export const useBootstrapDropdown = (dropdownId) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  // Safe Bootstrap operations
  const withBootstrap = useCallback((callback, fallback) => {
    if (window.bootstrap?.Dropdown) {
      try {
        return callback();
      } catch (error) {
        console.warn('Bootstrap operation failed:', error);
        return fallback?.();
      }
    } else {
      console.warn('Bootstrap not available');
      return fallback?.();
    }
  }, []);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    withBootstrap(
      () => {
        const instance = window.bootstrap.Dropdown.getInstance(button);
        if (instance) {
          instance.hide();
        } else {
          // Create new instance just to hide
          new window.bootstrap.Dropdown(button).hide();
        }
        setIsOpen(false);
      },
      () => {
        // Manual fallback
        const dropdownElement = document.getElementById(dropdownId);
        if (dropdownElement) {
          dropdownElement.classList.remove('show');
          button.classList.remove('show');
          button.setAttribute('aria-expanded', 'false');
          setIsOpen(false);
        }
      }
    );
  }, [withBootstrap, dropdownId]);

  // Open dropdown
  const openDropdown = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Close all other dropdowns
    document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach((btn) => {
      if (btn !== button) {
        withBootstrap(
          () => {
            const instance = window.bootstrap.Dropdown.getInstance(btn);
            instance?.hide();
          },
          () => {
            const otherId = btn.getAttribute('data-bs-target')?.replace('#', '');
            if (otherId) {
              document.getElementById(otherId)?.classList.remove('show');
              btn.classList.remove('show');
              btn.setAttribute('aria-expanded', 'false');
            }
          }
        );
      }
    });

    // Open this dropdown
    withBootstrap(
      () => {
        let instance = window.bootstrap.Dropdown.getInstance(button);
        if (!instance) {
          instance = new window.bootstrap.Dropdown(button);
        }
        instance.show();
        setIsOpen(true);
      },
      () => {
        const dropdownElement = document.getElementById(dropdownId);
        if (dropdownElement) {
          dropdownElement.classList.add('show');
          button.classList.add('show');
          button.setAttribute('aria-expanded', 'true');
          setIsOpen(true);
        }
      }
    );
  }, [withBootstrap, dropdownId]);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, closeDropdown, openDropdown]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isOpen) return;
      
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeDropdown]);

  // Bootstrap event listeners
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleShow = () => setIsOpen(true);
    const handleHide = () => setIsOpen(false);

    button.addEventListener('show.bs.dropdown', handleShow);
    button.addEventListener('hide.bs.dropdown', handleHide);
    button.addEventListener('hidden.bs.dropdown', handleHide);

    return () => {
      button.removeEventListener('show.bs.dropdown', handleShow);
      button.removeEventListener('hide.bs.dropdown', handleHide);
      button.removeEventListener('hidden.bs.dropdown', handleHide);
    };
  }, []);

  return { 
    containerRef, 
    buttonRef, 
    isOpen, 
    toggleDropdown 
  };
};