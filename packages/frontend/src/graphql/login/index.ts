import {
    gql
  } from "@apollo/client";

export const LOGIN = gql`
mutation SignIn($publicAddress: String! , $sign: String!) {
  signIn(payload: { publicAddress: $publicAddress, signature: $sign }){
    access_token
  }
}
`;

export interface IAccessToken{
    access_token: string;
}

export interface ISignIn{
    publicAddress: string;
    sign: string;
}