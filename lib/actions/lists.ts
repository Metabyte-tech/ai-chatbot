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
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const [newList] = await createProductList(name, session.user.id);
        revalidatePath("/");
        return newList;
    } catch (e: any) {
        console.error("createListAction error:", e?.message);
        throw new Error("Could not create list. Please ensure the database tables are set up.");
    }
}

export async function getUserListsAction() {
    const session = await auth();
    if (!session?.user) return []; // Guest users — return empty, don't crash

    try {
        return await getProductListsByUserId(session.user.id);
    } catch (e: any) {
        console.error("getUserListsAction error (tables may not exist):", e?.message);
        return []; // Fail gracefully — the UI will show "No lists found"
    }
}

export async function saveProductToListAction(listId: string, productData: any) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const [savedProductResult] = await addSavedProduct(listId, productData);
        revalidatePath(`/lists/${listId}`);
        return savedProductResult;
    } catch (e: any) {
        console.error("saveProductToListAction error:", e?.message);
        throw new Error("Could not save product. Please ensure the database tables are set up.");
    }
}

export async function getListWithProductsAction(listId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    try {
        const list = await getProductListById(listId);
        if (!list || list.userId !== session.user.id) throw new Error("List not found");
        const savedProducts = await getSavedProductsByListId(listId);
        return { list, savedProducts };
    } catch (e: any) {
        console.error("getListWithProductsAction error:", e?.message);
        throw new Error("Could not load list.");
    }
}
