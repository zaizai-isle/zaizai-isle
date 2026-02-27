'use client';

import React from 'react';

interface Heading {
    level: number;
    text: string;
    id: string;
}

/**
 * TOCNav - Client-side component for handling smooth scrolling within the Docs layout.
 * It calculates positions relative to the 'main' scroll container to fix issues with
 * reactive layouts and absolute positioning.
 */
export function TOCNav({ headings }: { headings: Heading[] }) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();

        // Find the actual element rendered in the DOM
        const element = document.getElementById(id);
        const mainContainer = document.querySelector('main');

        if (element && mainContainer) {
            // Calculate position relative to the mainContainer's current scroll
            const containerRect = mainContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Calculate top position: 
            // Current scroll + (Element's distance from viewport top - Container's distance from viewport top)
            const relativeTop = elementRect.top - containerRect.top + mainContainer.scrollTop;

            mainContainer.scrollTo({
                top: relativeTop - 32, // Apply 32px padding offset for better breathing room
                behavior: 'smooth'
            });

            // Update URL hash without causing a page jump
            window.history.pushState(null, '', `#${id}`);
        } else {
            console.warn(`[TOCNav] Target element #${id} not found in DOM.`);
        }
    };

    return (
        <nav className="space-y-0.5">
            {headings.map((heading, index) => (
                <a
                    key={index}
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    className={`block py-1.5 text-sm transition-all rounded-md cursor-pointer ${heading.level === 1
                            ? 'font-semibold text-gray-900 hover:bg-gray-200/50 px-4 mt-4 first:mt-0'
                            : heading.level === 2
                                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 px-4'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 pl-8 pr-4'
                        }`}
                >
                    {heading.text}
                </a>
            ))}
        </nav>
    );
}
