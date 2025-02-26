import { ApolloProvider } from '@apollo/client';
import client from './graphql/client';
import AppRoutes from './routes';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AppRoutes />
    </ApolloProvider>
  );
}
