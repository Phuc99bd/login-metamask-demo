import React from 'react'
import { Button, Box, Text } from "@chakra-ui/react";
import Identicon from "./Identicon";
import { useEffect, useRef, useState } from "react";
import { Injected } from '../connectors'
import Web3 from 'web3';
import Web3Modal from "web3modal";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/modal";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { toast, useToast } from '@chakra-ui/toast';
import { CircularProgress } from "@chakra-ui/react"
import { IRegister, IUser, GET_USER } from '../graphql/getUser';
import { useMutation, useQuery  } from '@apollo/client';
import { IAccessToken, ISignIn, LOGIN } from '../graphql/login';

type Props = {
  handleOpenModal: any;
  account: any;
  setAccount: any;
};

const RPCURL = "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

export default function ConnectButton({ handleOpenModal, account , setAccount }: Props) {
  const [isProcessing , setIsProcessing] = useState(false);
  const [isOpen , setIsOpen] = useState(false);
  const toast = useToast();
  const refAmount = React.createRef<HTMLInputElement>();
  const refAddress = React.createRef<HTMLInputElement>();
  let web3 = new Web3(RPCURL);
  
  const [getUser] = useMutation<IUser , IRegister>(GET_USER);
  const [signIn] = useMutation<IAccessToken , ISignIn>(LOGIN);

  const providerOptions = {
    /* See Provider Options Section */
  };
  
  const web3Modal = new Web3Modal({
    cacheProvider: true, // optional
    providerOptions // required
  });
  

  const [balance, setBalance] = useState(0);

  const getBalance = async () => {
      const balance: any =  account ? await web3.eth.getBalance(account) : null;
      if(balance){
        setBalance(+web3.utils.fromWei(balance));
      }
  }

  useEffect(() => {
    setInterval(()=> {
      getBalance()
    },1000)
  } , [account])

  useEffect(()=> {
    console.log(`account`, account);
  }, [account])

  const onClickSendTransaction = async () => {
    const provider = await web3Modal.connect();
    web3 = new Web3(provider);
    const value = refAmount?.current?.value || "0";
    const address = refAddress.current?.value;
    if(value && +value <= 0){
      toast({
        title: "Amount is greater than zero",
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      return;
    }
    if(value && +value > balance){
      toast({
        title: "Amount exceeds your current balance",
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      return;
    }
    if(!web3.utils.isAddress(address || "")){
      toast({
        title: "Address must a address blockchain in ropsten network",
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      return;
    }
    try {
      
      setIsProcessing(true);
      await web3.eth.sendTransaction({
        from: account,  
        to: address || "",
        value: web3.utils.toWei(value, "ether")
      }).then((data)=> {
        setIsProcessing(false);
        toast({
          title: "Transfer successfully",
          status: "success",
          duration: 2000,
          isClosable: true,
        })
        setIsOpen(false)
      })
      .catch((err)=> {
        toast({
          title: err?.message || 'error',
          status: "error",
          duration: 2000,
          isClosable: true,
        })
        setIsProcessing(false);
      })
    } catch (error) {
      toast({
        title: JSON.stringify(error),
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      setIsProcessing(false);
    }
  } 

  const onConnection = async () => {
    const provider = await web3Modal.connect();
    web3 = new Web3(provider);
    const publicAddress = await web3.eth.getCoinbase()
    if(!publicAddress){
      toast({
        title: "Please install metamask on browser.",
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      return;
    }
    getUser({
      variables: {
        address: publicAddress
      }
    }).then(async (data: any)=> {
      const { nonce , publicAddress } = data.data.findOrCreate;
      const signature = await web3.eth.personal.sign(
        `I am signing my one-time nonce: ${nonce}`,
        publicAddress,
        '' // MetaMask will ignore the password argument here
      );
      signIn({
        variables: {
          publicAddress,
          sign: signature
        }
      }).then((result: any)=> {
        setAccount(publicAddress ? publicAddress : null);
      })
      .catch((err)=> {
        toast({
          title: JSON.stringify(err),
          status: "error",
          duration: 2000,
          isClosable: true,
        })
      })
    })

  }

  return account ? (<>
  
    <Box
      display="flex"
      alignItems="center"
      background="gray.700"
      borderRadius="xl"
      py="0"
    >
      <Box px="3">
        <Text color="white" fontSize="md">
          {balance && (balance).toFixed(3)} ETH
        </Text>
      </Box>
      <Button
        onClick={handleOpenModal}
        bg="gray.800"
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "blue.400",
          backgroundColor: "gray.700",
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px"
      >
        <Text color="white" fontSize="md" fontWeight="medium" mr="2">
          {account &&
            `${account.slice(0, 6)}...${account.slice(
              account.length - 4,
              account.length
            )}`}
        </Text>
        <Identicon />
      </Button>
    </Box>
    <Modal
        isOpen={isOpen}
        onClose={()=> setIsOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer to a address</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <Input ref={refAmount} type={"number"} step="any" placeholder="Amount" defaultValue={"0.00"} />
              <FormLabel>To ETH Address</FormLabel>
              <Input ref={refAddress} type={"text"} placeholder="0xE5d2213F6065dd554e42919bc12A6B9B19052E0D" defaultValue="0xE5d2213F6065dd554e42919bc12A6B9B19052E0D"/>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClickSendTransaction} disabled={isProcessing}>
              {
                isProcessing ? <CircularProgress isIndeterminate color="green.300" value={5} /> : "Approve"
              }
            </Button>
            <Button colorScheme="red" mr={3} onClick={()=> setIsOpen(false)} disabled={isProcessing}>
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <br/>
    <Button bg="gray.600"
      onClick={() => setIsOpen(true)}
    >
          Transfer
    </Button>
    </>
  ) : (
    <Button
    onClick={onConnection}
      bg="blue.800"
      color="blue.300"
      fontSize="lg"
      fontWeight="medium"
      borderRadius="xl"
      border="1px solid transparent"
      _hover={{
        borderColor: "blue.700",
        color: "blue.400",
      }}
      _active={{
        backgroundColor: "blue.800",
        borderColor: "blue.700",
      }}
    >
      Connect to a wallet
    </Button>
  );
}
