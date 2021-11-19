import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import theme from "./theme";
import Layout from "./components/Layout";
import ConnectButton from "./components/ConnectButton";
import AccountModal from "./components/AccountModal";
import "@fontsource/inter";
import { useState } from "react";

import {
  ApolloClient,
  NormalizedCacheObject,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client';

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:8000/graphql',
});
 
 
function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [account, setAccount] = useState(null);
  return (
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <Layout>
          <ConnectButton handleOpenModal={onOpen} setAccount={setAccount} account={account} />
          <AccountModal isOpen={isOpen} onClose={onClose} setAccount={setAccount} account={account} />
        </Layout>
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default App;
