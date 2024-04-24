const fs = require('fs');
const Marked = require('marked');
const markdownForFile = require('../../utils/markdownToHtml');

jest.mock('fs');
jest.mock('marked');

describe('markdownForFile', () => {
  it('reads file and parses markdown when file exists', (done) => {
    const mockData = '# Hello World';
    const mockHtml = '<h1 id="hello-world">Hello World</h1>\n';
    fs.readFile.mockImplementationOnce((path, options, cb) => cb(null, mockData));
    Marked.parse.mockImplementationOnce((data, cb) => cb(null, mockHtml));

    markdownForFile('path/to/file', (err, data) => {
      expect(err).toBeNull();
      expect(data).toBe(mockHtml);
      done();
    });
  });

  it('returns error when file does not exist', (done) => {
    const mockError = new Error('File not found');
    fs.readFile.mockImplementationOnce((path, options, cb) => cb(mockError));

    markdownForFile('path/to/nonexistent/file', (err, data) => {
      expect(err).toEqual(mockError);
      expect(data).toBeUndefined();
      done();
    });
  });

  it('returns error when markdown parsing fails', (done) => {
    const mockData = '# Hello World';
    const mockError = new Error('Markdown parsing error');
    fs.readFile.mockImplementationOnce((path, options, cb) => cb(null, mockData));
    Marked.parse.mockImplementationOnce((data, cb) => cb(mockError));

    markdownForFile('path/to/file', (err, data) => {
      expect(err).toEqual(mockError);
      expect(data).toBeUndefined();
      done();
    });
  });
});