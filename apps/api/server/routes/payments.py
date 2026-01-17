from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import stripe
import os
from typing import Optional

router = APIRouter(prefix='/payments')

# 从环境变量读取 Stripe 密钥
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

# 产品价格配置（使用 Stripe Price IDs）
PRICE_IDS = {
    "monthly": os.getenv("STRIPE_PRICE_MONTHLY", ""),
    "yearly": os.getenv("STRIPE_PRICE_YEARLY", ""),
    "lifetime": os.getenv("STRIPE_PRICE_LIFETIME", "")
}


class CheckoutSessionRequest(BaseModel):
    plan: str  # monthly, yearly, lifetime
    success_url: str
    cancel_url: str
    user_email: Optional[str] = None


class PortalSessionRequest(BaseModel):
    customer_id: str
    return_url: str


@router.post('/create-checkout-session')
async def create_checkout_session(request: CheckoutSessionRequest):
    """
    创建 Stripe Checkout 会话
    用户点击订阅按钮时调用此接口
    """
    try:
        # 验证计划类型
        if request.plan not in PRICE_IDS:
            raise HTTPException(status_code=400, detail="无效的订阅计划")

        price_id = PRICE_IDS[request.plan]
        if not price_id:
            raise HTTPException(
                status_code=500,
                detail=f"未配置 {request.plan} 计划的价格 ID。请设置环境变量 STRIPE_PRICE_{request.plan.upper()}"
            )

        # 创建 Checkout Session
        session_params = {
            'payment_method_types': ['card', 'alipay', 'wechat_pay'],
            'line_items': [{
                'price': price_id,
                'quantity': 1,
            }],
            'mode': 'payment' if request.plan == 'lifetime' else 'subscription',
            'success_url': request.success_url + '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url': request.cancel_url,
            'metadata': {
                'plan': request.plan
            }
        }

        # 如果提供了邮箱，预填充客户信息
        if request.user_email:
            session_params['customer_email'] = request.user_email

        session = stripe.checkout.Session.create(**session_params)

        return {
            "success": True,
            "sessionId": session.id,
            "url": session.url
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe 错误: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建支付会话失败: {str(e)}")


@router.get('/session/{session_id}')
async def get_checkout_session(session_id: str):
    """
    获取 Checkout Session 详情
    用于验证支付是否成功
    """
    try:
        session = stripe.checkout.Session.retrieve(session_id)

        return {
            "success": True,
            "status": session.payment_status,
            "customer_email": session.customer_details.email if session.customer_details else None,
            "plan": session.metadata.get('plan', ''),
            "amount_total": session.amount_total,
            "currency": session.currency,
            "subscription_id": session.subscription if hasattr(session, 'subscription') else None
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe 错误: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取会话失败: {str(e)}")


@router.post('/create-portal-session')
async def create_portal_session(request: PortalSessionRequest):
    """
    创建客户门户会话
    用于用户管理订阅、查看发票等
    """
    try:
        session = stripe.billing_portal.Session.create(
            customer=request.customer_id,
            return_url=request.return_url,
        )

        return {
            "success": True,
            "url": session.url
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe 错误: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建客户门户失败: {str(e)}")


@router.post('/webhook')
async def stripe_webhook(request: Request):
    """
    Stripe Webhook 处理器
    处理订阅状态变化、支付成功等事件
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="无效的请求体")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="无效的签名")

    # 处理不同的事件类型
    event_type = event['type']

    if event_type == 'checkout.session.completed':
        session = event['data']['object']
        # 处理支付成功
        # TODO: 在这里更新数据库，激活用户订阅
        print(f"支付成功: {session.id}, 客户: {session.customer}")

    elif event_type == 'customer.subscription.updated':
        subscription = event['data']['object']
        # 处理订阅更新
        print(f"订阅更新: {subscription.id}")

    elif event_type == 'customer.subscription.deleted':
        subscription = event['data']['object']
        # 处理订阅取消
        print(f"订阅取消: {subscription.id}")

    elif event_type == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        # 处理发票支付成功
        print(f"发票支付成功: {invoice.id}")

    elif event_type == 'invoice.payment_failed':
        invoice = event['data']['object']
        # 处理发票支付失败
        print(f"发票支付失败: {invoice.id}")

    return {"success": True, "event": event_type}


@router.get('/plans')
async def get_plans():
    """
    获取可用的订阅计划
    """
    return {
        "success": True,
        "plans": [
            {
                "id": "monthly",
                "name": "月度订阅",
                "price": 29,
                "currency": "CNY",
                "interval": "month",
                "features": [
                    "无限论文搜索",
                    "AI 论文助手",
                    "研究路线图",
                    "数据导出",
                    "邮件支持"
                ]
            },
            {
                "id": "yearly",
                "name": "年度订阅",
                "price": 299,
                "currency": "CNY",
                "interval": "year",
                "savings": "节省 ¥49",
                "features": [
                    "月度订阅所有功能",
                    "优先客户支持",
                    "14% 折扣",
                    "提前访问新功能"
                ]
            },
            {
                "id": "lifetime",
                "name": "终身会员",
                "price": 999,
                "currency": "CNY",
                "interval": "lifetime",
                "features": [
                    "永久访问所有功能",
                    "终身免费更新",
                    "VIP 专属支持",
                    "未来所有新功能"
                ]
            }
        ]
    }
