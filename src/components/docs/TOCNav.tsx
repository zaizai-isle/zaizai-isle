'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface Heading {
    level: number;
    text: string;
    id: string;
}

interface VersionEntry {
    key: string;
    label: string;
    date: string;
    summary: string;
    href?: string;
    headings: Heading[];
}

const CURRENT_PRODUCT_KEY = 'PRODUCT_DOCUMENTATION.md';

/**
 * TOCNav - Client-side component for handling smooth scrolling within the Docs layout.
 * It calculates positions relative to the 'main' scroll container to fix issues with
 * reactive layouts and absolute positioning.
 */
export function TOCNav({
    currentProductHeadings,
    activeDocument,
    milestoneVersions,
}: {
    currentProductHeadings: Heading[];
    activeDocument: string;
    milestoneVersions: VersionEntry[];
}) {
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

    const renderSections = (items: Heading[], href: string, isActive: boolean) => items
        .filter((heading) => heading.level === 2)
        .map((heading) => isActive ? (
            <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(event) => handleClick(event, heading.id)}
                className="block rounded-md py-1 pl-5 pr-3 text-[13px] leading-5 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-400"
            >
                {heading.text}
            </a>
        ) : (
            <Link
                key={heading.id}
                href={`${href}#${heading.id}`}
                className="block rounded-md py-1 pl-5 pr-3 text-[13px] leading-5 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-400"
            >
                {heading.text}
            </Link>
        ));

    return (
        <nav aria-label="文档导航" className="space-y-2">
            <details open className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200/40 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-400 [&::-webkit-details-marker]:hidden">
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-90" strokeWidth={1.5} />
                    <span>🏝️ Zaizai Isle (V1.4.5)</span>
                </summary>
                <div className="ml-5 pb-1">
                    <div className="border-l border-gray-200">
                        {renderSections(currentProductHeadings, '/docs', activeDocument === CURRENT_PRODUCT_KEY)}
                    </div>
                </div>
            </details>

            <details open className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200/40 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-400 [&::-webkit-details-marker]:hidden">
                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-90" strokeWidth={1.5} />
                    <span>生长足迹</span>
                </summary>
                <div className="space-y-0.5 pb-2 pl-3">
                    {milestoneVersions.map((version) => {
                        const isActive = activeDocument === version.key;
                        return (
                            <details key={version.key} open={isActive} className="group/version rounded-lg">
                                <summary className={`flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-400 [&::-webkit-details-marker]:hidden ${
                                    isActive ? 'bg-gray-200/70 font-semibold text-gray-950' : 'text-gray-700 hover:bg-gray-200/50'
                                }`}>
                                    <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-open/version:rotate-90" strokeWidth={1.5} />
                                    <span className="min-w-0">
                                        <span>{version.label}</span>
                                        <span className="ml-2 text-xs font-normal text-gray-400">{version.date}</span>
                                    </span>
                                </summary>
                                <div className="pb-1.5 pl-8 pr-2 pt-1.5">
                                    {version.href && version.headings.length > 0 ? (
                                        <details open={isActive} className="group/document">
                                            <summary className="flex cursor-pointer list-none items-start gap-2 rounded-md text-xs leading-[1.55] text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gray-400 [&::-webkit-details-marker]:hidden">
                                                <span className="min-w-0 flex-1">{version.summary}</span>
                                                <ChevronRight aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-open/document:rotate-90" strokeWidth={1.5} />
                                            </summary>
                                            <div>
                                                {renderSections(version.headings, version.href, isActive)}
                                            </div>
                                        </details>
                                    ) : (
                                        <p className="px-2 py-1 text-xs leading-[1.55] text-gray-500">{version.summary}</p>
                                    )}
                                </div>
                            </details>
                        );
                    })}
                </div>
            </details>
        </nav>
    );
}
