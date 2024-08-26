'use client'

import { useState, useEffect } from 'react'
import { Box, Grid, Typography, Button, Modal, TextField, Card, CardContent, CardActions, Stack } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [newQuantity, setNewQuantity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
    } catch (error) {
      toast.error('Failed to load inventory')
    }
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + 1 })
        toast.success(`${item} quantity updated`)
      } else {
        await setDoc(docRef, { quantity: 1 })
        toast.success(`${item} added to inventory`)
      }
      await updateInventory()
    } catch (error) {
      toast.error('Failed to add item')
    }
  }

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
          toast.success(`${item} removed from inventory`)
        } else {
          await setDoc(docRef, { quantity: quantity - 1 })
          toast.success(`${item} quantity decreased`)
        }
      }
      await updateInventory()
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  const handleOpenUpdateModal = (item) => {
    setSelectedItem(item)
    setNewQuantity(item.quantity)
    setOpen(true)
  }

  const handleCloseUpdateModal = () => {
    setSelectedItem(null)
    setNewQuantity('')
    setOpen(false)
  }

  const updateItem = async () => {
    if (selectedItem) {
      try {
        const docRef = doc(collection(firestore, 'inventory'), selectedItem.name)
        await setDoc(docRef, { quantity: parseInt(newQuantity) }, { merge: true })
        await updateInventory()
        toast.success(`${selectedItem.name} updated`)
        handleCloseUpdateModal()
      } catch (error) {
        toast.error('Failed to update item')
      }
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor={'#f5f5f5'}
      padding={4}
    >
      <ToastContainer />

      <Stack direction="row" spacing={2} sx={{ marginBottom: 4, width: '100%' }}>
        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" color="secondary" onClick={clearSearch}>
          Clear Search
        </Button>
      </Stack>

      <Modal
        open={open}
        onClose={selectedItem ? handleCloseUpdateModal : handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'white',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {selectedItem ? `Update ${selectedItem.name}` : 'Add Item'}
          </Typography>
          <TextField
            id="outlined-basic"
            label={selectedItem ? "Quantity" : "Item"}
            variant="outlined"
            fullWidth
            value={selectedItem ? newQuantity : itemName}
            onChange={(e) => selectedItem ? setNewQuantity(e.target.value) : setItemName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={selectedItem ? updateItem : () => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            {selectedItem ? 'Update' : 'Add'}
          </Button>
        </Box>
      </Modal>

      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Item
      </Button>

      <Grid container spacing={3} sx={{ marginTop: 2 }}>
        {filteredInventory.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.name}>
            <Card sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
              <CardContent>
                <Typography variant="h5" component="div" color="text.primary">
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Quantity: {item.quantity}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button variant="outlined" color="error" onClick={() => removeItem(item.name)}>
                  Remove
                </Button>
                <Button variant="contained" color="primary" onClick={() => handleOpenUpdateModal(item)}>
                  Update
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
