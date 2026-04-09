"use server";

import { auth } from "@/app/(auth)/auth";
import { revalidatePath } from "next/cache";
import {
    createProductList,
    getProductListsByUserId,
    addSavedProduct,
    getSavedProductsByListId,
    getProductListById
} from "@/lib/db/queries";

export async function createListAction(name: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const [newList] = await createProductList(name, session.user.id);
    revalidatePath("/");
    return newList;
}

export async function getUserListsAction() {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    return await getProductListsByUserId(session.user.id);
}

export async function saveProductToListAction(listId: string, productData: any) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const [savedProduct] = await addSavedProduct(listId, productData);
    revalidatePath(`/lists/${listId}`);
    return savedProduct;
}

export async function getListWithProductsAction(listId: string) {
    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const list = await getProductListById(listId);
    if (!list || list.userId !== session.user.id) {
        throw new Error("List not found or unauthorized");
    }

    const savedProducts = await getSavedProductsByListId(listId);
    return { list, savedProducts };
}
