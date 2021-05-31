mod utils;
use std::mem;
use std::os::raw::c_void;
use std::slice;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// In order to work with the memory we expose (de)allocation methods
#[no_mangle]
pub extern "C" fn alloc(size: usize) -> *mut c_void {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    mem::forget(buf);
    return ptr as *mut c_void;
}

#[no_mangle]
pub extern "C" fn dealloc(ptr: *mut c_void, cap: usize) {
    unsafe {
        let _buf = Vec::from_raw_parts(ptr, 0, cap);
    }
}

#[wasm_bindgen]
pub fn rotate_180(pointer: *mut u8, width: usize, height: usize) {
    let pixel_length: usize = 4;
    let line_length = width * pixel_length;
    let half_height_untraited: f32 = (height as f32) / 2.0;
    let size = width * height * pixel_length;

    let half_height = ((half_height_untraited * 100.0).round() / 100.0) as usize;

    let sl = unsafe { slice::from_raw_parts_mut(pointer, size) };

    for line in 0..half_height {
        let start_of_line = line * line_length;
        let start_of_opposite_line = (height - 1 - line) * line_length;
        for column in 0..width {
            let pixel_start = start_of_line + column * pixel_length;
            let pixel_end = pixel_start + pixel_length;

            let opposite_pixel_start = start_of_opposite_line + column * pixel_length;
            let opposite_pixel_end = opposite_pixel_start + pixel_length;

            let opposite_pixel = [
                sl[opposite_pixel_start],
                sl[opposite_pixel_start + 1],
                sl[opposite_pixel_start + 2],
                sl[opposite_pixel_start + 3],
            ];
            let target_pixel = [
                sl[pixel_start],
                sl[pixel_start + 1],
                sl[pixel_start + 2],
                sl[pixel_start + 3],
            ];

            for item in opposite_pixel_start..opposite_pixel_end {
                let is = item - opposite_pixel_start;
                sl[item] = target_pixel[is];
            }
            for item in pixel_start..pixel_end {
                let is = item - pixel_start;
                sl[item] = opposite_pixel[is];
            }
        }
    }
}
