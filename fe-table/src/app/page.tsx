"use client";

import RestoreIcon from "@mui/icons-material/Restore";
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { Button } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridRowId,
  GridRowModel,
  GridSortModel,
  GridValidRowModel,
  useGridApiRef,
} from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";

interface Row {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
}

export default function Home() {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState<Row[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [hasUnsavedRows, setHasUnsavedRows] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 20,
    page: 0,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const unsavedChangesRef = useRef<{
    unsavedRows: Record<GridRowId, GridValidRowModel>;
    rowsBeforeChange: Record<GridRowId, GridValidRowModel>;
  }>({
    unsavedRows: {},
    rowsBeforeChange: {},
  });

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoading(true);
        const { page, pageSize } = paginationModel;
        const sortField = sortModel[0]?.field || "updatedAt";
        const sortOrder = sortModel[0]?.sort?.toUpperCase() || "DESC";

        const response = await fetch(
          "http://localhost:3001/employees?" +
            new URLSearchParams({
              page: String(page + 1),
              limit: String(pageSize),
              sortField,
              sortOrder,
            })
        );
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        setTotalRows(data.total);
        setRows(data.data);
        setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [paginationModel, sortModel]);

  const processRowUpdate = (updatedRow: GridRowModel, oldRow: GridRowModel) => {
    const rowId = updatedRow.id;

    unsavedChangesRef.current.unsavedRows[rowId] = updatedRow;
    if (!unsavedChangesRef.current.rowsBeforeChange[rowId]) {
      unsavedChangesRef.current.rowsBeforeChange[rowId] = oldRow;
    }

    setHasUnsavedRows(true);
    return updatedRow;
  };

  const handleSave = async () => {
    try {
      // Persist updates in the database
      setLoading(true);
      const response = await fetch("http://localhost:3001/employees", {
        method: "PATCH",
        body: JSON.stringify(unsavedChangesRef.current.unsavedRows),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      setLoading(false);

      setHasUnsavedRows(false);
      unsavedChangesRef.current = {
        unsavedRows: {},
        rowsBeforeChange: {},
      };
    } catch (error) {
      setLoading(false);
    }
  };

  const discardChanges = () => {
    setHasUnsavedRows(false);
    Object.values(unsavedChangesRef.current.rowsBeforeChange).forEach((row) => {
      apiRef.current.updateRows([row]);
    });
    unsavedChangesRef.current = {
      unsavedRows: {},
      rowsBeforeChange: {},
    };
  };

  const columns: GridColDef[] = [
    {
      field: "firstName",
      headerName: "First Name",
      width: 150,
      editable: true,
    },
    { field: "lastName", headerName: "Last Name", width: 150, editable: true },
    { field: "position", headerName: "Position", width: 200, editable: true },
    { field: "phone", headerName: "Phone", width: 150, editable: true },
    { field: "email", headerName: "Email", flex: 1, editable: true },
  ];

  return (
    <div className="flex flex-col w-full bg-white text-black">
      <div className="flex justify-between items-center mb-4 p-5">
        <h2 className="text-2xl font-semibold">Editable Table</h2>
        <div className="flex justify-end">
          <LoadingButton
            disabled={!hasUnsavedRows}
            loading={loading}
            onClick={handleSave}
            startIcon={<SaveIcon />}
            loadingPosition="start"
          >
            <span>Save</span>
          </LoadingButton>
          <Button
            disabled={!hasUnsavedRows || loading}
            onClick={discardChanges}
            startIcon={<RestoreIcon />}
          >
            Discard all changes
          </Button>
        </div>
      </div>

      <div className="w-full h-[800px] p-5">
        <DataGrid
          apiRef={apiRef}
          initialState={{
            pagination: { paginationModel: { pageSize: 20 } },
          }}
          rows={rows}
          rowCount={totalRows}
          columns={columns}
          paginationMode="server"
          pageSizeOptions={[20, 50, 100]}
          onPaginationModelChange={setPaginationModel}
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnMenu
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => {
            console.log("error", error);
          }}
          sortingMode="server"
          onSortModelChange={setSortModel}
          loading={loading}
          className="text-gray-800 bg-white shadow-md"
        />
      </div>
    </div>
  );
}
