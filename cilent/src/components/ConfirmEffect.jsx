// src/components/DeleteEffect.js
import Swal from "sweetalert2";

// ✅ ต้อง return promise แล้ว resolve true/false จาก isConfirmed
const ConfirmEffect = () => {
  return Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Edit",
    cancelButtonText: "Cancel",
  }).then((result) => {
    return result.isConfirmed; // ✅ true ถ้ากด "Yes", false ถ้า "Cancel"
  });
};

export default ConfirmEffect;
