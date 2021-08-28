import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import NativeSelect from "@material-ui/core/NativeSelect";
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';

import { useState } from "react";
import { useEffect } from "react";

const API_URL = 'https://ivehement.herokuapp.com'

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 650,
  },
  selectEmpty: {
    border: "1px solid #ced4da",
    borderRadius: 5,
    marginTop: theme.spacing(0),
  },
}));

export default function Home() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState({});
  const [subcategories, setSubcategories] = useState({});
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [productName, setProductName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(true);
  const [isAsc, setIsAsc] = useState(true);

  const handleSort = (type) => {
      let tempRows = rows;
      if(isAsc) {
        tempRows.sort((a, b) => {
            if(a[type] > b[type]) return 1;
            if(a[type] < b[type]) return -1;
            return 0;
        })
      }
      else {
        tempRows.sort((a, b) => {
            if(a[type] < b[type]) return 1;
            if(a[type] > b[type]) return -1;
            return 0;
        })
      }
      setIsAsc(!isAsc);
      setRows(tempRows);
  }

  const handleShowAdd = () => {
    setShowAdd(!showAdd);
  };
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  const handleSubCategoryChange = (event) => {
    setSubcategory(event.target.value);
  };
  const handleNameChange = (event) => {
    setProductName(event.target.value);
  };
  const handleSave = () => {
    setIsSaving(true);
    if (subcategory !== "" && productName.length > 2) {
      fetch(`${API_URL}/product`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ProductName: productName,
          subCategory: subcategory,
        }),
      })
        .then((res) => res.json())
        .then((message) => {
          if (message !== "Failed to Add.") {
            let tempRows = rows;
            tempRows.push({
              product: productName,
              subcategory: subcategories[subcategory]["SubCategoryName"],
              category: categories[category]["CategoryName"],
            });
            setRows(tempRows);
          }
          setProductName('');
          setCategory('');
          setIsSaving(false);
          setShowAdd(!showAdd);
        });
    }
    else {
        setProductName('');
        setCategory('');
        setIsSaving(false);
        setShowAdd(!showAdd);
    }
  };

  let Categories = {};
  let SubCategories = {};
  let Products = [];

  const lineObject = () => {
    let tempRow = [];
    for (let i = 0; i < Products.length; i++) {
      let row = {};
      row["product"] = Products[i]["ProductName"];
      row["subcategory"] =
        SubCategories[Products[i]["subCategory"]]["SubCategoryName"];
      row["category"] =
        Categories[SubCategories[Products[i]["subCategory"]]["category"]][
          "CategoryName"
        ];
      tempRow.push(row);
    }
    setRows(tempRow);
    setCategories(Categories);
    setSubcategories(SubCategories);
  };

  useEffect(() => {
    fetch(`${API_URL}/category`)
      .then((res) => res.json())
      .then((categories) => {
        if (categories.length > 0) {
          return categories.forEach((category) => {
            Categories[category["id"]] = category;
            fetch(`${API_URL}/category/${category["id"]}`)
              .then((res) => res.json())
              .then((subcategories) => {
                if (subcategories.length > 0) {
                  return subcategories.forEach((subcategory) => {
                    SubCategories[subcategory["id"]] = subcategory;
                    fetch(
                      `${API_URL}/product/subcategory/${subcategory["id"]}`
                    )
                      .then((res) => res.json())
                      .then((products) => {
                        return products.forEach((product, i) => {
                          Products.push(product);
                          if (i === products.length - 1) lineObject(); //check
                        });
                      });
                  });
                }
              });
          });
        }
      })
      .catch((err) => console.log(err));
  }, []);
  const classes = useStyles();

  return (
    <Container maxWidth="lg">
      {showAdd ? (
        <Button onClick={handleShowAdd} variant="contained" color="secondary">
          Add
        </Button>
      ) : null}
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Button onClick={() => handleSort('product')} color="primary">
                  <span style={{ fontWeight: "800" }}>Product</span>
                  <UnfoldMoreIcon />
                </Button>
              </TableCell>
              <TableCell align="right">
                <Button onClick={() => handleSort('subcategory')} color="primary">
                  <span style={{ fontWeight: "800" }}>Subcategory</span>
                  <UnfoldMoreIcon />
                </Button>
              </TableCell>
              <TableCell align="right">
                <Button onClick={() => handleSort('category')} color="primary">
                  <span style={{ fontWeight: "800" }}>Category</span>
                  <UnfoldMoreIcon />
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.product}>
                <TableCell component="th" scope="row">
                  {row.product}
                </TableCell>
                <TableCell align="right">{row.subcategory}</TableCell>
                <TableCell align="right">{row.category}</TableCell>
              </TableRow>
            ))}
            {!showAdd ? (
              <TableRow key={"save"}>
                <TableCell component="th" scope="row">
                  <TextField
                    id="standard-basic"
                    label="Product Name"
                    onChange={handleNameChange}
                  />
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="contained"
                    color="primary"
                  >
                    Save
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <NativeSelect
                    className={classes.selectEmpty}
                    value={subcategory}
                    onChange={handleSubCategoryChange}
                  >
                    <option value="" disabled>
                      Subcategory
                    </option>
                    {Object.keys(subcategories).map((id) => {
                      if (subcategories[id]["category"] === Number(category)) {
                        return (
                          <option key={id} value={id}>
                            {subcategories[id]["SubCategoryName"]}
                          </option>
                        );
                      }
                    })}
                  </NativeSelect>
                </TableCell>
                <TableCell align="right">
                  <NativeSelect
                    className={classes.selectEmpty}
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="" disabled>
                      Category
                    </option>
                    {Object.keys(categories).map((id) => {
                      return (
                        <option key={id} value={id}>
                          {categories[id]["CategoryName"]}
                        </option>
                      );
                    })}
                  </NativeSelect>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
