Deno.serve(async (req) => {
    return Response.json({ message: 'Test function works' });
});