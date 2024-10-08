import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { hostNameBack } from "./constants";


export async function addToWishlistUtil(e, itemId, itemType, user) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!user || !token) {
    enqueueSnackbar("Please login to access this feature!", { variant: "error" });
    return false;
  }

  try {
    const response = await axios.post(`${hostNameBack}/api/v1/wishlists/`, { itemId, itemType }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      enqueueSnackbar(response.data.message || "Added to Wishlist", { variant: "success" });
      return true;
    } else {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      return false;
    }
  } catch (e) {
    enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
    return false;
  }
}


export async function removeFromWishlistUtil(e, itemId, itemType, user) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!user || !token) {
    enqueueSnackbar("Please login to access this feature!", { variant: "error" });
    return false;
  }

  try {
    const response = await axios.delete(`${hostNameBack}/api/v1/wishlists/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { itemId, itemType }
    });
    if (response.data.success) {
      enqueueSnackbar(response.data.message || "Removed from Wishlist", { variant: "success" });
      return true;
    } else {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      return false;
    }
  } catch (e) {
    enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
    return false;
  }
}


export async function fetchWishlistUtil(user) {
  const token = localStorage.getItem("token");

  if (!user || !token)
    return null;

  try {
    const response = await axios.get(`${hostNameBack}/api/v1/wishlists/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success)
      return response.data.wishlists;
    else {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      return null;
    }
  } catch (e) {
    return null;
  }
}


export async function addToCartUtil(e, productId, count, user) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!user || !token) {
    enqueueSnackbar("Please login to access this feature!", { variant: "error" });
    return false;
  }

  try {
    const response = await axios.post(`${hostNameBack}/api/v1/carts/`, { productId, count }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      enqueueSnackbar(response.data.message || "Added to Cart", { variant: "success" });
      return true;
    } else {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      return false;
    }
  } catch (e) {
    enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
    return false;
  }
}


export async function removeFromCartUtil(e, productId, count, user) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!user || !token) {
    enqueueSnackbar("Please login to access this feature!", { variant: "error" });
    return false;
  }

  try {
    const response = await axios.delete(`${hostNameBack}/api/v1/carts/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { productId, count }
    });
    if (response.data.success) {
      enqueueSnackbar(response.data.message || "Removed from Cart", { variant: "success" });
      return true;
    } else {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      return false;
    }
  } catch (e) {
    enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
    return false;
  }
}


export async function fetchCartUtil(user) {
  const token = localStorage.getItem("token");

  if (!user || !token)
    return null;

  try {
    const response = await axios.get(`${hostNameBack}/api/v1/carts/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success)
      return response.data.cart;
    else {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      return null;
    }
  } catch (e) {
    return null;
  }
}


export async function updateCartUtil(e, productId, count, user) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!user || !token) {
    enqueueSnackbar("Please login to access this feature!", { variant: "error" });
    return null;
  }

  try {
    const response = await axios.put(`${hostNameBack}/api/v1/carts/`, { productId, count }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success)
      return response.data.cart;
    else {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      return null;
    }
  } catch (e) {
    enqueueSnackbar(e.response.data.error || "Something went wrong!", { variant: "error" });
    return null;
  }
}



export function formatDate(date) {
  const options = { month: 'short', day: 'numeric', year: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
}

export function formatDateTime(date) {
  const options = { month: 'short', day: 'numeric', year: '2-digit' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
  const formattedDate = new Date(date).toLocaleDateString(undefined, options);
  const formattedTime = new Date(date).toLocaleTimeString(undefined, timeOptions);
  return `${formattedTime} - ${formattedDate}`;
}