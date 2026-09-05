import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          skills: path.resolve(__dirname, 'public/Sub_Pages/Skills.html'),
          food: path.resolve(__dirname, 'public/Sub_Pages/Food.html'),
          projects: path.resolve(__dirname, 'public/Sub_Pages/Projects.html'),
          resume: path.resolve(__dirname, 'public/Sub_Pages/resume.html'),
          courses: path.resolve(__dirname, 'public/Sub_Pages/courses.html'),
          homelab: path.resolve(__dirname, 'public/Sub_Pages/HomeLab.html'),
          reading: path.resolve(__dirname, 'public/Sub_Pages/Reading.html'),
          gaming: path.resolve(__dirname, 'public/Sub_Pages/Game.html'),
          coins: path.resolve(__dirname, 'public/Sub_Pages/Coins.html'),
          puzzle: path.resolve(__dirname, 'public/Sub_Pages/Puzzle.html'),
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
