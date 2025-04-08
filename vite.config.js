import { readdirSync, readFile, writeFile } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getTableRows() {
	const parentPath = './dist/assets';
	let htmlRows = [];
	const fileNames = readdirSync(parentPath);
	for(let file of fileNames) {
		if(file.endsWith('.js')) {
			const name = `/assets/${file}`;
			const licenseURL = 'http://www.gnu.org/licenses/gpl-3.0.html';
			const licenseName = 'GNU-GPL-3.0-or-later';
			const sourceURL = 'https://github.com/jacob-willden/the-cliche-rpg/blob/main/src/App.jsx';
			const sourceName = 'App.jsx';
			htmlRows += `<tr><td><a href="${name}">${name}</a></td><td><a href="${licenseURL}">${licenseName}</a></td><td><a href="${sourceURL}">${sourceName}</a></td></tr>`;
		}
	}
	return `<table id="jslicense-labels1"><tbody>${htmlRows}</tbody></table>`;
}

function scriptLicensesTable() {
	return {
		name: 'script-licenses-table',
		async closeBundle() {
			readFile(import.meta.dirname + '/dist/javascript.html', 'utf-8', (error, oldHTML) => {
				if(error) {
					console.error(error);
					return;
				}
				const regex = /\<table id=\"jslicense-labels1\">.*\<\/table>/;
				const newHTML = oldHTML.replace(regex, getTableRows());
				writeFile(import.meta.dirname + '/dist/javascript.html', newHTML, error => {
					if(error) console.error(error);
				});
			});
		}
	}
}

// https://vitejs.dev/config/
// https://github.com/vitejs/vite/issues/378#issuecomment-768816653
export default defineConfig({
	plugins: [react(), scriptLicensesTable()],
	build: {
		rollupOptions: {
			input: {
				main: resolve('index.html'),
				javascript: resolve('javascript.html')
			}
		}
	}
})