const { src, dest, series, parallel, task } = require('gulp');
const stream = require('stream');
const del = require('del')

const prepare = series(
  () => src('./package.json')
    .pipe(dest('./dist'))
)

const postpublish = series(
  () => del('./dist')
)

module.exports = {
  prepare,
  postpublish,
}