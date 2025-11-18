import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.menus["$post"]>;
type RequestType = InferRequestType<typeof client.api.menus["$post"]>["json"];

export const useGenerateMenu = () => {
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.menus.$post({ json });
      return await response.json();
    },
  });

  return mutation;
};