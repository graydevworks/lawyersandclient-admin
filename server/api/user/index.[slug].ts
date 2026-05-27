export default defineEventHandler((event) => {
  // event.context.params.slug to get the route segment: 'bar/baz'

  console.log(event)
  return `Default foo handler`
})
