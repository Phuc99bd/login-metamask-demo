import {
    gql
  } from "@apollo/client";
export const GET_USER = gql`
mutation FindOrCreate($address: String!) {
   findOrCreate(payload: { publicAddress: $address }){
    _id,
    publicAddress,
    nonce
  }
}
`;

export interface IUser{
    _id: string;
    publicAddress: string;
    nonce?: number;
    createdAt: Date;
}

export interface IRegister{
    address: string;
}