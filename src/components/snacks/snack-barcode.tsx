import Barcode from "react-barcode";

export function SnackBarcode({ barcode }: { barcode: string }) {
  return <Barcode value={barcode} format="EAN13" displayValue={true} />;
}
