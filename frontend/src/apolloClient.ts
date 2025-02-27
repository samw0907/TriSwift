import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const token = await localStorage.getItem('token'); // Ensure token is retrieved
  console.log("Current Token:", token); // Debug token loading
  return {
    headers: {
      ...headers,
      "Content-Type": "application/json",
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
