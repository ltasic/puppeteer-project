# puppeteer-project

This project utilizes Puppeteer to scrape prices from a given URL.

## Installation

1. Clone the repository:

git clone <repository_url>

2. Install dependencies:

npm install

## Usage

To scrape prices, run the following command:

npm run build:dev

This command will compile TypeScript files and run the index.js file. The scraped data will be stored in a file named scraped_data.json.

## Makefile

A Makefile is provided for convenience. You can use it to build and run the project easily. Here are the available targets:

- build: Compiles TypeScript files.
- run: Runs the compiled JavaScript file.
- clean: Removes the dist directory.

To use the Makefile, run make <target_name>.

## Dependencies

- puppeteer: ^22.1.0
- typescript: ^5.3.3
