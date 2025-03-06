import app from './app';

const port = process.env.PORT || 5050;
export default app.listen(port, () => console.log(`* Listening: http://localhost:${port}`));
