import { AdventureType } from '../types';

const iconPaths: Record<AdventureType, string> = {
    [AdventureType.Travel]: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 5.2 5.2c.4.4 1 .5 1.4.3l.5-.3c.4-.3.6-.7.5-1.2z" />',
    [AdventureType.Event]: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />',
    [AdventureType.Hiking]: '<path d="m8 3 4 8 5-5 5 15H2L8 3z" />',
    [AdventureType.Camping]: '<path d="M19 20 L19 10 L12 3 L5 10 L5 20" /><path d="M12 11 L12 20" /><path d="M3 20 L21 20" />',
    [AdventureType.Volunteering]: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />',
    [AdventureType.Cycling]: '<circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 17.5h-5.5l1.5-5 4-3 2 3h-3" /><path d="M5.5 14l-3-3" />',
};

export const getAdventureIconDataUrl = (type: AdventureType): string => {
  const iconPath = iconPaths[type] || '';

  const svgString = `
    <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.9348 15.8553 45.7196 17.2912 47.4623C17.6853 47.9429 18.3147 47.9429 18.7088 47.4623C20.1447 45.7196 36 29.9348 36 18C36 8.05887 27.9411 0 18 0Z" fill="#F97316"/>
      <g transform="translate(6, 6)" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        ${iconPath}
      </g>
    </svg>
  `.replace(/\s\s+/g, ' ');

  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};