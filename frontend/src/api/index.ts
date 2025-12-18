/**
 * API接口定义
 * 定义所有后端API接口的调用方法 - 网上书店管理系统
 */
import api_client from './client'

// 用户认证相关接口
export const auth_api = {
    // 用户登录
    login: (username: string, password: string) =>
        api_client.post('/auth/login', { username, password }),

    // 用户注册
    register: (data: {
        username: string
        email: string
        password: string
        real_name: string
        phone?: string
        address?: string
    }) =>
        api_client.post('/auth/register', data),

    // 获取用户资料
    get_profile: () =>
        api_client.get('/auth/profile'),

    // 更新用户资料
    update_profile: (data: {
        real_name?: string
        email?: string
        phone?: string
        address?: string
    }) =>
        api_client.put('/auth/profile', data),

    // 删除账户
    delete_account: () =>
        api_client.delete('/auth/account'),

    // 修改密码
    change_password: (data: {
        current_password: string
        new_password: string
    }) =>
        api_client.post('/auth/change-password', data),
}

// 图书管理相关接口
export const book_api = {
    // 获取图书列表
    get_books: (params?: {
        keyword?: string
        category_id?: string
        publisher_id?: string
        min_price?: number
        max_price?: number
        page?: number
        limit?: number
    }) =>
        api_client.get('/books', { params }),

    // 获取图书详情
    get_book: (isbn: string) =>
        api_client.get(`/books/${isbn}`),

    // 搜索图书
    search_books: (keyword: string) =>
        api_client.get('/books/search', { params: { keyword } }),
}

// 订单管理相关接口
export const order_api = {
    // 获取订单列表
    get_orders: (params?: {
        status?: string
        start_date?: string
        end_date?: string
        page?: number
        limit?: number
    }) =>
        api_client.get('/orders', { params }),

    // 获取订单详情
    get_order: (order_id: string) =>
        api_client.get(`/orders/${order_id}`),

    // 创建订单
    create_order: (data: {
        items: Array<{
            isbn: string
            quantity: number
        }>
        shipping_address: string
        recipient_name: string
        recipient_phone: string
    }) =>
        api_client.post('/orders', data),

    // 取消订单
    cancel_order: (order_id: string) =>
        api_client.post(`/orders/${order_id}/cancel`),
}

// 统计分析相关接口
export const stats_api = {
    // 获取销售统计
    get_sales_stats: (params?: {
        start_date?: string
        end_date?: string
    }) =>
        api_client.get('/stats/sales', { params }),

    // 获取库存统计
    get_inventory_stats: () =>
        api_client.get('/stats/inventory'),

    // 获取用户统计
    get_customer_stats: () =>
        api_client.get('/stats/customers'),
}

// 系统相关接口
export const system_api = {
    // 健康检查
    health_check: () =>
        api_client.get('/system/health'),
}
